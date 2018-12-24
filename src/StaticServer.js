import { readdir } from 'fs';
import path, { basename, extname } from 'path';
import express from 'express'

import { success, log } from './utils/index';

export default class StaticServer {
  constructor() {
    this.app = express();
  }

  start = (scenesRoot) => new Promise((resolve, reject) => {
    this.app.use(express.static(scenesRoot));
    const listener = this.app.listen(0, () => {
      const { port } = listener.address();
      log(success(`Started server on port ${port}`), '\n');
      this.url = `http://localhost:${port}`;

      readdir(scenesRoot, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  })

  get = (file) => `${this.url}/${basename(file)}`
}
