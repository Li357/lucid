import Scene from './Scene';

export function stitch(...scenes) {
  if (!scenes.every(sceneArg => sceneArg instanceof Scene)) {
    throw new Error('Can only stitch scenes!');
  }
  // TODO: Finish array argument version
  return new Scene(scenes);
}

export default function scene(sceneCreator) {
  return new Scene(sceneCreator);
}
