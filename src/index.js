import Scene from './Scene';
import StaticServer from './StaticServer';

import { texHelper, d3Helper } from './helpers/index';
import { log, error } from './utils/index';

function sceneFactoryFrom(scenesRoot, server, {
  d3URL = 'https://d3js.org/d3.v5.min.js',
  mathJaxURL = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js',
  mathJaxOptions = {},
  browserOptions,
} = {}) {
  return function scene(htmlFile) {
    // Scenes load d3, mathjax by default, and expose a tex helper for LaTeX
    return new Scene(scenesRoot, server.get(htmlFile), browserOptions)
      .registerHelper(d3Helper(d3URL))
      .registerHelper(texHelper(mathJaxURL, mathJaxOptions));
  };
}

export default async function start(scenesRoot, options) {
  try {
    const server = new StaticServer();
    await server.start(scenesRoot);
    return sceneFactoryFrom(scenesRoot, server, options);
  } catch (e) { // Reading scenesRoot directory failed
    log(error(`Failed to read scenes root ${scenesRoot}!`), '\n');
    throw e; // Rethrow so that hopefully user will handle
  }
}
