import Scene from './Scene';

export function stitch(...scenes) {
  if (!scenes.every(sceneArg => sceneArg instanceof Scene)) {
    throw new Error('Can only stitch scenes!');
  }
  
  const [firstScene, ...otherScenes] = scenes;
  const newScene = firstScene.clone();
  newScene.jobs = otherScenes.reduce((acc, { sceneCreator, options }) => [
    ...acc,
    () => {
      newScene.sceneCreator = sceneCreator;
      newScene.options = options;
    },
    newScene.record,
  ], newScene.jobs);
  return newScene;
}

export default function scene(sceneCreator) {
  return new Scene(sceneCreator);
}
