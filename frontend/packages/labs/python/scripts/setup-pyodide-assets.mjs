// Assemble the pyodide assets the standalone demo serves at
// /pyodide/<version>/. The library build does NOT need this — the studio host
// serves its own hosted copy (see pyodideConfig). It only supports `yarn dev`.
//
// Two sources, both already in the repo (nothing is downloaded):
//   - pyodide core (wasm, stdlib, lock, loader) from node_modules/pyodide
//   - package + custom wheels from apps/lib/pyodide (matplotlib, numpy, deps,
//     and our pythonlab_setup / neighborhood / unittest_runner builds)
//
// Output lands in public/pyodide/<version>/ (git-ignored). Idempotent: it skips
// files already present, so it is cheap to run on every `predev`.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..', '..', '..');

const {version} = require('pyodide');
const pyodideDir = dirname(require.resolve('pyodide/package.json'));
const wheelsDir = join(repoRoot, 'apps', 'lib', 'pyodide');
const outDir = join(pkgRoot, 'public', 'pyodide', version);

// The pyodide core files loadPyodide() fetches from indexURL.
const CORE_FILES = [
  'pyodide.mjs',
  'pyodide.js',
  'pyodide.asm.js',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json',
];

mkdirSync(outDir, {recursive: true});

const copyIfNewer = (src, dest) => {
  if (!existsSync(src)) {
    throw new Error(`Missing expected source file: ${src}`);
  }
  if (existsSync(dest) && statSync(dest).size === statSync(src).size) {
    return false;
  }
  copyFileSync(src, dest);
  return true;
};

let copied = 0;

for (const name of CORE_FILES) {
  if (copyIfNewer(join(pyodideDir, name), join(outDir, name))) {
    copied++;
  }
}

// Every wheel/zip apps vendors (package deps + our custom wheels). loadPackage
// resolves standard packages by the lock's filenames, which match these.
for (const name of readdirSync(wheelsDir)) {
  if (name.endsWith('.whl') || name.endsWith('.zip')) {
    if (copyIfNewer(join(wheelsDir, name), join(outDir, name))) {
      copied++;
    }
  }
}

console.log(
  `pyodide assets ready at public/pyodide/${version}/ (${copied} file(s) copied)`,
);
