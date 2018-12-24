import babel from 'rollup-plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
    exports: 'named',
  },
  plugins: [
    babel({ exclude: 'node_modules/**' }),
  ],
  external: [
    'fs',
    'rimraf',
    'path',
    'readline',
    'util',
    'child_process',
    'express',
    'puppeteer',
    'chalk',
  ],
};