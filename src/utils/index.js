import { clearLine, cursorTo } from 'readline';
import chalk from 'chalk';

export function withOptionAccessors(cls, options) {
  Object.keys(options).forEach((key) => {
    /* eslint-disable-next-line no-param-reassign */
    cls.prototype[key] = function accessor(newValue) {
      if (typeof this.options === 'undefined') {
        this.options = options;
      }

      if (typeof newValue !== 'undefined') {
        this.options[key] = newValue;
        return this;
      }

      return this.options[key];
    };
  });
  return cls;
}

export function range(start, stop) {
  return Array(stop - start).fill().map((_, i) => i);
}

export function progress(...text) {
  return chalk`{bgYellow.bold  PROGRESS } ${text}`;
}

export function success(...text) {
  return chalk`{bgGreen.bold  SUCCESS } ${text}`;
}

export function error(...text) {
  return chalk`{bgRed.bold  ERROR } ${text}`;
}

export function progressbar(percentage, width = 20) {
  const blocks = Math.ceil(percentage * width);
  return chalk`{bgGreen ${' '.repeat(blocks)}}{bgWhite ${' '.repeat(width - blocks)}}`;
}

export function log(...texts) {
  process.stdout.write(texts.join(''));
}

export function clearAndLog(...texts) {
  clearLine(process.stdout, 0);
  cursorTo(process.stdout, 0);
  log(...texts);
}
