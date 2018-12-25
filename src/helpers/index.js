export function d3Helper(d3URL) {
  return function d3Adder(page) {
    return page.addScriptTag({ url: d3URL });
  };
}

export function texHelper(mathJaxURL, config) {
  return async function texAdder(page) {
    // Initialize MathJax (comes before MathJax include)
    await page.addScriptTag({
      type: 'text/x-mathjax-config',
      content: `
        MathJax.Hub.Config({
          extensions: ['tex2jax.js'],
          jax: ['input/TeX', 'output/SVG'],
          tex2jax: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            processEscapes: true,
            processEnvironments: true,
          },
          TeX: {
            extensions: ['AMSmath.js', 'AMSsymbols.js', 'noErrors.js', 'noUndefined.js'],
          },
          messageStyle: 'none',
          ...${JSON.stringify(config)},
        });
      `,
    });
    await page.addScriptTag({ url: mathJaxURL });

    // Attach `tex` function
    await page.evaluate(() => {
      window.tex = (strs, ...subs) => new Promise((resolve, reject) => {
        const reconstructed = subs.reduce((acc, sub, i) => acc + sub + strs.raw[i + 1], strs.raw[0]);

        const tmpDiv = d3.select('body').append('div')
          .style('visibility', 'hidden')
          .text(reconstructed);

        MathJax.Hub.Queue(
          ['Typeset', MathJax.Hub, tmpDiv.node()],
          () => {
            const output = tmpDiv.select('svg').node();
            if (!output) {
              reject('MathJax could not process source!');
              return;
            }

            const g = d3.select('#L_SVG').append('g');
            tmpDiv.select('svg > g')
              .attr('fill', null) // need to remove MathJax's default coloring (so that it inherits from g)
              .attr('stroke', null)
              .attr('stroke-width', null);
            g.append(() => output);
            tmpDiv.remove();
            resolve(g);
          },
        );
      });
    });
  };
}
