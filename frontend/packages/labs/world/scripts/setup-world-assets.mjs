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
//   fontawesome/    — the icon font, with WORLD_DEMO_ICONS=free; see below
//
// Run: node scripts/setup-world-assets.mjs   (wired as `yarn setup:world`)

import * as esbuild from 'esbuild';
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

import {backgroundFileName, backgroundUrls} from './stockBackgroundNames.mjs';
import {soundEntries, soundFileName} from './stockSoundNames.mjs';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const vendorDir = join(pkgRoot, 'public', 'vendor');
const backgroundsDir = join(pkgRoot, 'public', 'backgrounds');
const soundsDir = join(pkgRoot, 'public', 'sounds');

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

// FontAwesome, when this build is asked to carry its own icons.
//
// The design system loads FontAwesome PRO from `dsco.code.org`, and that CDN
// answers CORS only for code.org origins — a webfont is always a CORS request,
// so a demo deployed anywhere else loads the stylesheets fine and then draws
// every icon as an empty box. `WORLD_DEMO_ICONS=free` swaps in the FREE
// distribution, which is already in the workspace (labs/base depends on it) and
// is redistributable: CC BY 4.0 for the icons, SIL OFL for the fonts.
//
// A copy, not a download — the package is on disk, so this step needs no
// network and cannot half-succeed. Free is a smaller set than Pro; what is
// missing is remapped in `src/freeIconShims.ts`, and the demo says so in the
// console when it meets an icon nothing draws.
const faDir = join(vendorDir, 'fontawesome');
if (process.env.WORLD_DEMO_ICONS !== 'free') {
  // Both directions, or the flag stops deciding anything: `public/` is copied
  // whole into a build, so a copy left behind by an earlier flagged run ships
  // as 400KB of files nothing asks for.
  if (existsSync(faDir)) {
    rmSync(faDir, {recursive: true, force: true});
    console.log('world assets: removed the self-hosted FontAwesome copy');
  }
} else {
  const from = dirname(
    require.resolve('@fortawesome/fontawesome-free/package.json'),
  );
  mkdirSync(join(faDir, 'css'), {recursive: true});
  mkdirSync(join(faDir, 'webfonts'), {recursive: true});

  // The sheets Free ships that we use, and every webfont they name. No
  // `duotone`, `v4-font-face` or `custom-icons` — those are Pro's.
  const sheets = [
    'fontawesome.min.css',
    'solid.min.css',
    'regular.min.css',
    'brands.min.css',
    'v4-shims.min.css',
  ];
  for (const name of sheets) {
    copyFileSync(join(from, 'css', name), join(faDir, 'css', name));
  }
  // Only woff2: every browser this runs in reads it, and the .ttf beside it is
  // three times the size for nobody.
  const fonts = readdirSync(join(from, 'webfonts')).filter(name =>
    name.endsWith('.woff2'),
  );
  for (const name of fonts) {
    copyFileSync(join(from, 'webfonts', name), join(faDir, 'webfonts', name));
  }
  // Attribution travels with the files, which is what the licence asks.
  copyFileSync(join(from, 'LICENSE.txt'), join(faDir, 'LICENSE.txt'));
  console.log(
    `world assets: self-hosted FontAwesome Free ` +
      `(${sheets.length} sheets, ${fonts.length} webfonts)`,
  );
}

// The stock sounds, fetched the way the backdrops are and for the same reason:
// upstream is 1598 files behind the studio API, and a demo with no code.org
// origin still has to be able to play a coin (specs/SOUND.md). Skipped when
// already present, and a download that fails is reported rather than fatal.
const soundListing = join(pkgRoot, 'sounds.txt');
if (!existsSync(soundListing)) {
  console.warn('world assets: no sounds.txt — skipping stock sounds');
} else {
  mkdirSync(soundsDir, {recursive: true});
  const entries = soundEntries(readFileSync(soundListing, 'utf8'));
  const wanted = entries.filter(({id}) => {
    const file = join(soundsDir, soundFileName(id));
    return !existsSync(file) || statSync(file).size === 0;
  });
  const LANES = 6;
  const failures = [];
  const queue = [...wanted];
  const fetchOne = async ({id, url}) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length === 0) {
      throw new Error('empty response');
    }
    // Written whole, so an interrupted run leaves no half an mp3 for the next
    // run to mistake for a finished download.
    writeFileSync(join(soundsDir, soundFileName(id)), bytes);
  };
  await Promise.all(
    Array.from({length: Math.min(LANES, queue.length)}, async () => {
      for (let entry = queue.shift(); entry; entry = queue.shift()) {
        try {
          await fetchOne(entry);
        } catch (error) {
          failures.push(`${entry.id}: ${error.message}`);
        }
      }
    }),
  );
  if (failures.length) {
    console.warn(
      `world assets: ${failures.length} stock sound(s) could not be ` +
        `fetched — ${failures.join('; ')}`,
    );
  }
  const got = entries.length - failures.length;
  console.log(
    wanted.length
      ? `world assets: ${got} stock sounds in public/sounds/`
      : `world assets: ${entries.length} stock sounds already present`,
  );
}

// The sprite drawings used to be written out here as files. They are not any
// more: `write-stock-assets.mjs` bakes them into the source as data URLs, which
// is what the library hands out at import time, and nothing fetches them. Any
// PNGs still under public/vendor/sprites on a long-lived checkout are leftovers
// from before that, and are ignored by git and by the lab alike.

console.log('world assets: ready in public/vendor/');
