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
//   backgrounds/    — the stock backdrops, fetched from the animation library
//                     (backgrounds.txt); see BACKGROUNDS.md §7
//
// Run: node scripts/setup-world-assets.mjs   (wired as `yarn setup:world`)

import * as esbuild from 'esbuild';
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {backgroundFileName, backgroundUrls} from './stockBackgroundNames.mjs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const vendorDir = join(pkgRoot, 'public', 'vendor');
const backgroundsDir = join(pkgRoot, 'public', 'backgrounds');

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

// The stock backdrops.
//
// Fetched rather than committed: they are the animation library's art, they are
// large next to a 32-pixel sprite, and there are enough of them that carrying
// the bytes in the repo would cost every checkout for a library most branches
// never touch. `backgrounds.txt` (committed) is the list; `public/backgrounds/`
// (ignored) is where the bytes land, which is where the demo serves them from.
//
// Idempotent, and offline-tolerant: a backdrop already on disk is left alone,
// and a download that fails is reported and skipped rather than failing the
// setup — a dev machine without the network still gets a working lab, minus the
// part of the library it could not reach.
const listing = join(pkgRoot, 'backgrounds.txt');
if (!existsSync(listing)) {
  console.warn('world assets: no backgrounds.txt — skipping stock backdrops');
} else {
  mkdirSync(backgroundsDir, {recursive: true});
  const urls = backgroundUrls(readFileSync(listing, 'utf8'));
  const missing = urls.filter(url => {
    const file = join(backgroundsDir, backgroundFileName(url));
    return !existsSync(file) || statSync(file).size === 0;
  });

  // A few at a time: enough to hide the round trips, few enough to stay a
  // polite client of someone else's server.
  const LANES = 6;
  const failures = [];
  const queue = [...missing];
  const fetchOne = async url => {
    const name = backgroundFileName(url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0) {
      throw new Error('empty response');
    }
    // Written whole, so an interrupted run leaves no half a PNG that the next
    // run would mistake for a finished download.
    writeFileSync(join(backgroundsDir, name), bytes);
    return name;
  };
  await Promise.all(
    Array.from({length: Math.min(LANES, queue.length)}, async () => {
      for (let url = queue.shift(); url; url = queue.shift()) {
        try {
          await fetchOne(url);
        } catch (error) {
          failures.push(`${backgroundFileName(url)}: ${error.message}`);
        }
      }
    }),
  );

  const have = urls.length - failures.length;
  if (missing.length === 0) {
    console.log(`world assets: ${have} stock backdrops already present`);
  } else {
    console.log(
      `world assets: fetched ${missing.length - failures.length} stock backdrops ` +
        `(${have}/${urls.length} present)`,
    );
  }
  for (const failure of failures) {
    console.warn(`world assets: could not fetch ${failure}`);
  }
}

// Generate the built-in sprite + animation images the preview loads as
// self-hosted assets.

console.log('world assets: ready in public/vendor/');
