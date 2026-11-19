// Bundles CodeMirror 6 setup (initializeCodeMirror6) for the Text Compression widget page.
// Usage: APPS_DIR=/path/to/code-dot-org/apps node build.js
const path = require('path');
const APPS_DIR = path.resolve(process.env.APPS_DIR || '../../../apps');
const esbuild = require(path.join(APPS_DIR, 'node_modules/esbuild'));
const stub = {
  name: 'stub',
  setup(b) {
    b.onResolve({filter: /MainInstructionsPreview$|util\/createReactRoot$|templates\/SafeMarkdown$|codemirror\.inline-attach$/}, a => ({path: a.path, namespace: 'stub'}));
    b.onLoad({filter: /.*/, namespace: 'stub'}, () => ({contents: 'export default function(){return null}; export const createReactRoot=()=>{}', loader: 'js'}));
  },
};
esbuild.build({
  entryPoints: [path.join(__dirname, 'harness-entry.js')], bundle: true, outfile: path.join(__dirname, 'tc-harness.js'), plugins: [stub],
  loader: {'.js': 'jsx', '.ts': 'ts', '.tsx': 'tsx'}, define: {'process.env.NODE_ENV': '"development"'},
  alias: {'@cdo/apps': path.join(APPS_DIR, 'src')}, nodePaths: [path.join(APPS_DIR, 'node_modules')], logLevel: 'warning',
}).then(() => console.log('built tc-harness.js')).catch(e => { console.error(e.message); process.exit(1); });
