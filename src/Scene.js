import { existsSync, mkdirSync, writeFile } from 'fs';
import { resolve, basename } from 'path';
import { promisify } from 'util';
import rimraf from 'rimraf';
import { exec } from 'child_process';

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

const promisifiedExec = promisify(exec);
const promisifiedWrite = promisify(writeFile);
const options = {
  fps: 60,
  duration: 1000,
  width: 1920,
  height: 1080,
  path: '', // Empty string so accessor is registered (actually set in constructor)
  name: '',
  frames: false,
};

class Scene {
  constructor(scenesRoot, url, browserOptions) {
    this.options = options;

    // Name of the output mp4 file, defaults to scene HTML file name
    this.name(basename(url, '.html'));
    // Path represents the directory where mp4 and frames are created, which matches name option by default
    this.path(resolve(scenesRoot, this.name()));

    const { width, height } = this.options;
    this.browser = new Browser(url, width, height, browserOptions);
    this.screenshots = [];
    this.helpers = [];
  }

  registerHelper = (helper) => {
    this.helpers.push(helper);
    return this;
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
    await Promise.all(this.screenshots.map((base64, i) => promisifiedWrite(
      resolve(this.path(), `frames/frame-${i}.png`),
      base64,
      'base64',
    )));
  }

  // TODO: Really would be great to decouple 
  output = async (outputDir = this.path(), outputName = this.name()) => {
    this.path(outputDir);
    this.name(outputName);

    const frameDir = resolve(outputDir, 'frames');
    const outputPath = resolve(outputDir, `${outputName}${outputName.endsWith('.mp4') ? '' : '.mp4'}`);

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
      await this.browser.registerHelpers(this.helpers); // Register scene helpers before scene setup
      await this.browser.initializeGlobals();
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
      clearAndLog(success(`Generated frames to ${frameDir}.`), '\n');

      // Create mp4 from frames via ffmpeg
      step = 'Generating mp4 from frames';
      log(progress(`${step}...`));
      await promisifiedExec(`rm -f ${outputPath}`); // force to ignore non-existance
      await promisifiedExec(
        `ffmpeg -r 60 -f image2 -s 1920x1080 -i ${resolve(frameDir, 'frame-%d.png')} `
        + `-vcodec libx264 -crf 25 -pix_fmt yuv420p ${outputPath}`,
      );
      clearAndLog(success(`Saved to ${outputPath}.`), '\n');

      if (!this.frames()) {
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
