// Copies the sandbox's self-hosted runtime assets into public/vendor/ so the
// standalone demo serves them at an origin-relative path (no CDN, no runtime
// network — mirrors python-lab's setup-pyodide-assets.mjs). The library build
// does not run this; the studio host serves its own hosted copies.
//
//   esbuild.wasm    — the compile surface's bundler (milestone 2)
//   phaser.esm.js   — the preview surface's engine (milestone 3)
//
// Run: node scripts/setup-world-assets.mjs   (wired as `yarn setup:world`)

import {existsSync, mkdirSync, copyFileSync, statSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const vendorDir = join(here, '..', 'public', 'vendor');

/** Resolve a file inside an installed package (which may not export it). */
function pkgFile(pkg, ...segments) {
  return join(dirname(require.resolve(`${pkg}/package.json`)), ...segments);
}

const assets = [
  {from: pkgFile('esbuild-wasm', 'esbuild.wasm'), to: 'esbuild.wasm'},
  {from: pkgFile('phaser', 'dist', 'phaser.esm.js'), to: 'phaser.esm.js'},
];

mkdirSync(vendorDir, {recursive: true});

let copied = 0;
for (const {from, to} of assets) {
  const dest = join(vendorDir, to);
  if (!existsSync(from)) {
    throw new Error(`missing source asset: ${from}`);
  }
  // Idempotent: skip when the destination already matches by size.
  if (existsSync(dest) && statSync(dest).size === statSync(from).size) {
    continue;
  }
  copyFileSync(from, dest);
  copied += 1;
  console.log(`world assets: copied ${to}`);
}

console.log(
  copied === 0
    ? 'world assets: up to date'
    : `world assets: ${copied} file(s) copied to public/vendor/`,
);
