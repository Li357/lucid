# lucid
D3 SVG animations to MP4. Animations are constructed from scenes, which are functions that are
executed in a headless browser context where D3 is loaded by default, and an SVG is already created:

```js
import scene, { stitch } from 'lucid';

const HelloWorld = () => {
  const svg = d3.select('svg');
  const { width, height } = svg.node().getBoundingClientRect();

  const txt = svg.append('text')
    .text('Hello World!')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height / 2)
    .style('opacity', 0);
  
  txt.transition()
    .duration(1500)
    .style('opacity', 1);
}

const ByeWorld = () => {
  const svg = d3.select('svg');
  const { width, height } = svg.node().getBoundingClientRect();

  const txt = svg.append('text')
    .text('Bye World!')
    .attr('text-anchor', 'middle')
    .attr('x', width / 2)
    .attr('y', height / 2)
    .style('opacity', 1);
  
  txt.transition()
    .duration(1500)
    .style('opacity', 0);
}

const helloScene = scene(HelloWorld)
  .duration(3000);
const byeScene = scene(ByeWorld)
  .duration(3000);

stitch(helloScene, byeScene)
  .frames(true)
  .path(__dirname)
  .output('video.mp4')
  .then(process.exit);
```

Which yields:

![Demo](./assets/demo.gif)