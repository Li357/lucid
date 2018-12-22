import Scene from './Scene';
import StaticServer from './StaticServer';

const server = new StaticServer();

export default function scene(htmlFile) {
  server.serve(htmlFile);
  return new Scene(server.url);
}
