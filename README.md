# Lucid

D3 SVG animations to MP4. Animations are constructed from a `scene`, which starts a  headless browser. The
`scene` constructor is given after `start` initializes and starts statically serving a scenes directory.
All other paths are resolved relative to the scenes directory by default. D3 and MathJax are loaded by 
default.

```js
import start from 'lucid';

start(`${__dirname}/scenes`) // Starts static server to serve scene HTML files
  .then((scene) => { // Resolves to scene constructor
    const intro = scene('scene.html') // scene.html inside scenes/
      .duration(500)
      .output(); // By default outputs frames to scenes/scene/frames (if kept) and scenes/scene.mp4

    return Promise.all([intro]); // Can parallelize scene creation
  })
  .then(process.exit);
```

And in `scenes/scene.html`:

```html
<!DOCTYPE html>
<html>
  <body>
    <script>
      /**
       * Globals exposed via puppeteer:
       * - L_TIME (mocked time for animation control)
       * - L_WIDTH (width of SVG, animation)
       * - L_HEIGHT
       * - L_ONSTART (hook called when lucid is ready)
       * - L_STARTED (variable that signals if lucid has started recording)
       * 
       * - tex(...) (uses mathjax to create a g element of rendered LaTeX)
       */
      L_ONSTART = async (START_RECORDING) => {
        // Initial svg code prep
        const svg = d3.select('#L_SVG')
          .style('background-color', 'black');

        // Rendering LaTeX before recording starts
        const latex = await tex('$$f(x) = \\int_{-\\infty}^\\infty\\hat f(\\xi)\\,e^{2 \\pi i \\xi x}\\,d\\xi$$');
        const { width, height } = latex.node().getBoundingClientRect();
        latex
          .style('transform', `translate(${(L_WIDTH - width * 3) / 2}px, ${(L_HEIGHT - height * 3) / 2}px) scale(3)`)
          .attr('fill', 'white');

        // Start recording (sets L_STARTED to true)
        START_RECORDING();

        // Transitions
        latex.transition()
          .duration(500)
          .style('opacity', 0);
      }
    </script>
  </body>
</html>
```

Which yields (without looping):

![Demo](./assets/demo.gif)

Extensible via helpers, which are functions that receive the current page and an add scripts, etc. to the current page. Default loads d3 and tex helpers.

# Todo
- Multiple scenes
- Parallelize multi-scenes
- Better API
- Optimizations for static durations