import { launch } from 'puppeteer';

export default class Browser {
  constructor(url, width, height) {
    this.url = url;
    this.width = width;
    this.height = height;
  }

  start = async (browserOptions) => {
    const browser = await launch(browserOptions);
    this.page = await browser.newPage();
    await this.page.goto(this.url);
  }

  registerHelpers = helpers => Promise.all(helpers.map(helper => helper(this.page)))

  initializeGlobals = async (shouldRecord) => {
    const { width, height } = this;
    await this.page.setViewport({ width, height });
    await this.page.evaluate((w, h, record) => {
      window.L_TIME = 0; // binding global vars
      window.L_WIDTH = w;
      window.L_HEIGHT = h;
      window.L_ONSTART = window.L_ONSTART || (() => {
        throw new Error('No hook for L_ONSTART to start scene!');
      });
      window.L_STARTED = false;
      
      if (record) {
        window.performance.now = () => window.L_TIME; // mock current time for transitions
      }

      d3.select('body').append('svg')
        .attr('id', 'L_SVG')
        .attr('width', w)
        .attr('height', h)
        .attr('viewBox', `0 0 ${w} ${h}`);

      window.L_ONSTART(() => {
        window.L_STARTED = true;
      });
    }, width, height, shouldRecord);
    await this.page.waitForFunction(() => window.L_STARTED);
  }

  setTimer = newVal => this.page.evaluate((newTime) => {
    window.L_TIME = newTime;
  }, newVal)

  goto = url => this.page.goto(url)

  screenshot = async () => {
    const svg = await this.page.$('#L_SVG');
    return svg.screenshot({ encoding: 'base64' });
  }
}
