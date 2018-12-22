import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { promisify } from 'util';
import rimraf from 'rimraf';
import { exec } from 'child_process';
import { launch } from 'puppeteer';
import { range } from 'd3';
import chalk from 'chalk';

import { withOptionAccessors, resolveSequentially } from './utils/index';

const options = {
  fps: 60,
  duration: 1000,
  width: 1920,
  height: 1080,
  path: __dirname,
  file: 'output.mp4',
  frames: false,
};

class Scene {
  constructor(sceneCreator) {
    this.options = options;
    this.sceneCreator = sceneCreator;
    this.framePrefix = 0;
    this.jobs = [
      this.initializeBrowser,
      this.createSVG,
      this.record,
    ];
  }

  initializeBrowser = async () => {
    const browser = await launch();
    this.page = await browser.newPage();
    await this.page.goto('about:blank');
    await this.page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js' });
  }

  createSVG = async () => {
    const { width, height } = this.options;
    await this.page.setViewport({ width, height });
    await this.page.evaluate((w, h) => {
      /* eslint-disable no-undef */
      performance.now = () => currentTime;

      d3.select('body')
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .attr('viewBox', `0 0 ${w} ${h}`);
      /* eslint-enable no-undef */
    }, width, height);
  }

  record = async () => {
    /* eslint-disable-next-line no-undef */
    await this.page.evaluate(() => currentTime = 0);
    await this.page.evaluate(this.sceneCreator);

    const setCurrentTime = (frameID, FPS) => {
      /* eslint-disable-next-line no-undef */
      currentTime = frameID * 1000 / FPS;
    };

    const { duration, fps } = this.options;
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    const numberOfFrames = duration / 1000 * fps;
    for (const frame of range(numberOfFrames)) {
      await this.page.evaluate(setCurrentTime, frame, fps);

      const svgEl = await this.page.$('svg');
      await svgEl.screenshot({
        path: resolve(this.options.path, `output/frames/frame-${frame + this.framePrefix}.png`),
      });
    }
    this.framePrefix += numberOfFrames;
    await this.page.$eval('svg', el => el.innerHTML = '');
    /* eslint-enable no-restricted-syntax, no-await-in-loop */
  }

  output = async (newFilename = this.options.filename) => {
    this.file(newFilename);

    const { log } = console;
    const outputDir = resolve(this.options.path, 'output');
    const frameDir = resolve(outputDir, 'frames');

    try {
      if (!existsSync(frameDir)) {
        mkdirSync(frameDir, { recursive: true });
        log(chalk`{bgGreen.bold  SUCCESS } Created output directory.`);
      }
    } catch (e) {
      log(chalk`{bgRed.bold  ERROR } Creating output directory: ${e}`);
      return;
    }

    try {
      await resolveSequentially(this.jobs);
      log(chalk`{bgGreen.bold  SUCCESS } Created frames.`);
    } catch (e) {
      log(chalk`{bgRed.bold  ERROR } Creating frames: ${e}`);
      return;
    }

    try {
      const execPromised = promisify(exec);
      const outputFile = resolve(outputDir, newFilename);

      await execPromised(`rm -f ${outputFile}`); // force to ignore non-existance
      await execPromised(
        `ffmpeg -r 60 -f image2 -s 1920x1080 -i ${resolve(frameDir, 'frame-%d.png')} -vcodec libx264 -crf 25 -pix_fmt yuv420p ${outputFile}`,
      );
      log(chalk`{bgGreen.bold  SUCCESS } Saved to {underline ${outputFile}}.`);
    } catch (e) {
      log(chalk`{bgRed.bold  ERROR } Creating mp4: ${e}`);
      return;
    }

    if (!this.options.frames) {
      try {
        await promisify(rimraf)(frameDir);
        log(chalk`{bgGreen.bold  SUCCESS } Removed frames.`);
      } catch (e) {
        log(chalk`{bgRed.bold  ERROR } Removing frames: ${e}`);
      }
    }
  }

  clone() {
    const instance = new Scene(this.sceneCreator);
    instance.options = this.options;
    return instance;
  }
}

export default withOptionAccessors(Scene, options);
