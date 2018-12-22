import { existsSync, mkdirSync, writeFile } from 'fs';
import { resolve, dirname } from 'path';
import { promisify } from 'util';
import rimraf from 'rimraf';
import { exec } from 'child_process';

import chalk from 'chalk';

import {
  withOptionAccessors,
  success,
  error,
  progress,
  progressbar,
  log,
  clearAndLog,
  range,
} from './utils/index';
import Browser from './Browser';

const options = {
  fps: 60,
  duration: 1000,
  width: 1920,
  height: 1080,
  path: resolve(__dirname, 'output.mp4'),
  frames: false,
  d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min.js',
};

class Scene {
  constructor(url) {
    this.options = options;

    const { width, height } = this.options;
    this.browser = new Browser(url, width, height);
    this.screenshots = [];
  }

  record = async (frameCallback = () => {}) => {
    const { duration, fps } = this.options;
    const numberOfFrames = duration / 1000 * fps;
    /* eslint-disable no-restricted-syntax, no-await-in-loop */
    for (const frame of range(1, numberOfFrames + 1)) {
      frameCallback(frame, numberOfFrames);
      this.browser.setTimer(frame * 1000 / fps);
      this.screenshots.push(await this.browser.screenshot());
    }
    /* eslint-enable no-restricted-syntax, no-await-in-loop */

    // Take advantage of parallelization for writing to files
    const promisifiedWrite = promisify(writeFile);
    await Promise.all(this.screenshots.map((base64, i) => promisifiedWrite(
      resolve(dirname(this.options.path), `frames/frame-${i}.png`),
      base64,
      'base64',
    )));
  }

  output = async (outputPath = this.options.path) => {
    this.path(outputPath);
    const frameDir = resolve(dirname(outputPath), 'frames');

    let step;
    try {
      if (!existsSync(frameDir)) {
        // First create output directory for frames/mp4 if don't exist
        step = 'Creating frame directory';
        log(progress(`${step}...`));
        mkdirSync(frameDir, { recursive: true });
        clearAndLog(success(`Created frame directory at ${frameDir}.`), '\n');
      }

      // Start browser
      step = 'Starting headless browser';
      log(progress(`${step}...`));
      await this.browser.start();
      await this.browser.loadD3(this.options.d3);
      clearAndLog(success('Started headless browser.'), '\n');

      // Generate frames
      step = 'Generating frames';
      log(progress(`${step}...`));
      await this.record((frame, numberOfFrames) => {
        clearAndLog(
          progress(`Frame ${frame}/${numberOfFrames}:`),
          progressbar(frame / numberOfFrames),
        );
      });
      clearAndLog(success(chalk`Generated frames to {underline ${frameDir}}`), '\n');

      // Create mp4 from frames via ffmpeg
      step = 'Generating mp4 from frames';
      log(progress(`${step}...`));
      const promisifiedExec = promisify(exec);
      await promisifiedExec(`rm -f ${outputPath}`); // force to ignore non-existance
      await promisifiedExec(
        `ffmpeg -r 60 -f image2 -s 1920x1080 -i ${resolve(frameDir, 'frame-%d.png')} `
        + `-vcodec libx264 -crf 25 -pix_fmt yuv420p ${outputPath}`,
      );
      clearAndLog(success(chalk`Saved to {underline ${outputPath}}.`), '\n');

      if (!this.options.frames) {
        // Remove frames if not needed
        step = 'Removing frames';
        log(progress(`${step}...`));
        await promisify(rimraf)(frameDir);
        clearAndLog(success('Removed frames.'), '\n');
      }
    } catch (e) {
      log('\n', error(`${step}: ${e}`), '\n');
    }
  }
}

export default withOptionAccessors(Scene, options);
