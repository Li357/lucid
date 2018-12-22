# lucid
D3 SVG animations to video

```js
import scene, { stitch } from 'lucid';

const HelloWorld = (svg) => {
  
}

const ByeWorld = (svg) => {

}

const helloScene = scene(HelloWorld)
  .duration(3000);
const byeScene = scene(ByeWorld)
  .duration(3000);

stitch(helloScene, byeScene)
  .frames(true)
  .output(__dirname, 'video.mp4');
```