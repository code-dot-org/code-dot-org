// Prepares the sandbox's self-hosted runtime assets in public/vendor/ so the
// standalone demo serves them at an origin-relative path (no CDN, no runtime
// network — mirrors python-lab's setup-pyodide-assets.mjs). The library build
// does not run this; the studio host serves its own hosted copies.
//
//   esbuild.wasm    — the compile surface's bundler (copied)
//   phaser.esm.js   — the preview surface's engine dependency (copied)
//   world-lab.mjs   — the engine, bundled from src/engine; the compiler rewrites
//                     the learner's `import 'world-lab'` to this URL, so there is
//                     exactly one engine instance (PLAN §7 / §10)
//
// Run: node scripts/setup-world-assets.mjs   (wired as `yarn setup:world`)

import * as esbuild from 'esbuild';
import {existsSync, mkdirSync, copyFileSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const vendorDir = join(pkgRoot, 'public', 'vendor');

/** Resolve a file inside an installed package (which may not export it). */
function pkgFile(pkg, ...segments) {
  return join(dirname(require.resolve(`${pkg}/package.json`)), ...segments);
}

mkdirSync(vendorDir, {recursive: true});

// Copy third-party binaries (idempotent — skip when size already matches).
const copies = [
  {from: pkgFile('esbuild-wasm', 'esbuild.wasm'), to: 'esbuild.wasm'},
  {from: pkgFile('phaser', 'dist', 'phaser.esm.js'), to: 'phaser.esm.js'},
];
for (const {from, to} of copies) {
  const dest = join(vendorDir, to);
  if (!existsSync(from)) {
    throw new Error(`missing source asset: ${from}`);
  }
  if (existsSync(dest) && statSync(dest).size === statSync(from).size) {
    continue;
  }
  copyFileSync(from, dest);
  console.log(`world assets: copied ${to}`);
}

// Bundle the engine to a single self-contained ESM module. Rebuilt every run —
// it is our own source and cheap to bundle.
await esbuild.build({
  entryPoints: [join(pkgRoot, 'src', 'engine', 'index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  outfile: join(vendorDir, 'world-lab.mjs'),
  logLevel: 'silent',
});
console.log('world assets: bundled world-lab.mjs');

// Generate the built-in sprite + animation images the preview loads as
// self-hosted assets.

console.log('world assets: ready in public/vendor/');
