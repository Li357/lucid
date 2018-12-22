import { clearLine, cursorTo } from 'readline';
import chalk from 'chalk';

export function withOptionAccessors(cls, options) {
  Object.entries(options).forEach(([key, initialValue]) => {
    /* eslint-disable-next-line no-param-reassign */
    cls.prototype[key] = function accessor(newValue) {
      if (newValue) {
        this.options[key] = newValue || initialValue;
        return this;
      }
      return this.options[key] || initialValue;
    };
  });
  return cls;
}

export function range(start, stop) {
  return Array(stop - start).fill().map((_, i) => i);
}

export function progress(...texts) {
  return chalk`{bgYellow.bold  PROGRESS } ${texts.join(' ')}`;
}

export function success(...texts) {
  return chalk`{bgGreen.bold  SUCCESS } ${texts.join(' ')}`;
}

export function error(...texts) {
  return chalk`{bgRed.bold  ERROR } ${texts.join(' ')}`;
}

export function progressbar(percentage, width = 20) {
  const blocks = Math.ceil(percentage * width);
  return chalk`{bgGreen ${' '.repeat(blocks)}}{bgWhite ${' '.repeat(width - blocks)}}`;
}

export function log(...texts) {
  process.stdout.write(texts.join(' '));
}

export function clearAndLog(...texts) {
  clearLine(process.stdout, 0);
  cursorTo(process.stdout, 0);
  log(...texts);
}
