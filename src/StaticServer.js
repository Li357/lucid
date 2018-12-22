import { createServer } from 'http';
import { promisify } from 'util';
import { readFile } from 'fs';

import { error, success, log } from './utils/index';

export default class StaticServer {
  constructor(port = 8080) {
    createServer(async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      try {
        res.end(await promisify(readFile)(this.file));
      } catch (e) {
        log('\n', error('Could not find specified scene!'), '\n');
        res.end();
        process.exit();
      }
    }).listen(port);
    log(success(`Started served on ${port}`), '\n');

    this.url = `http://localhost:${port}`;
  }

  serve = (file) => {
    this.file = file;
  }
}
