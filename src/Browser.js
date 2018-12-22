import { launch } from 'puppeteer';

export default class Browser {
  constructor(url, width, height) {
    this.url = url;
    this.width = width;
    this.height = height;
  }

  start = async () => {
    const browser = await launch();
    this.page = await browser.newPage();
    await this.page.goto(this.url);
  }

  loadD3 = async (url) => {
    await this.page.addScriptTag({ url });

    const { width, height } = this;
    await this.page.setViewport({ width, height });
    await this.page.evaluate((w, h) => {
      /* eslint-disable no-undef */
      TIME = 0; // binding global vars
      WIDTH = w;
      HEIGHT = h;
      performance.now = () => TIME; // mock current time for transitions

      d3.select('body')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .attr('viewBox', `0 0 ${w} ${h}`);
      onLucidStart();
      /* eslint-enable no-undef */
    }, width, height);
  }

  setTimer = newVal => this.page.evaluate((newTime) => {
    /* eslint-disable-next-line no-undef */
    TIME = newTime;
  }, newVal);

  goto = url => this.page.goto(url);

  screenshot = async () => {
    const svg = await this.page.$('svg');
    return svg.screenshot({ encoding: 'base64' });
  }
}
