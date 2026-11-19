// Bundles the IconList + searchAssets harness twice: src-staging (code before the fix) and src-pr (after).
// Usage: APPS_DIR=/path/to/code-dot-org/apps node build.js
const path = require('path');
const APPS_DIR = path.resolve(process.env.APPS_DIR || '../../../apps');
const esbuild = require(path.join(APPS_DIR, 'node_modules/esbuild'));

(async () => {
  for (const v of ['staging', 'pr']) {
    await esbuild.build({
      entryPoints: [path.join(__dirname, `src-${v}/main.jsx`)],
      bundle: true,
      outfile: path.join(__dirname, `dist/${v}.js`),
      loader: {'.js': 'jsx'},
      define: {'process.env.NODE_ENV': '"development"'},
      alias: {
        '@cdo/apps': path.join(__dirname, `src-${v}`),
        '@cdo/locale': path.join(__dirname, 'stub/locale.js'),
      },
      nodePaths: [path.join(APPS_DIR, 'node_modules')],
      logLevel: 'warning',
    });
  }
  console.log('built dist/staging.js and dist/pr.js');
})();
