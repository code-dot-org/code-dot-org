#!/usr/bin/env node
// Usage: node update.mjs <kit.zip> [--dry-run] [--skip-upload]
// --skip-upload edits the repo files but leaves the kit in a temp dir for a manual S3 upload.
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const [zip, ...flags] = process.argv.slice(2);
const dry = flags.includes('--dry-run');
const skipUpload = flags.includes('--skip-upload');
const KNOWN_FLAGS = ['--dry-run', '--skip-upload'];
const unknown = [...(zip?.startsWith('--') ? [zip] : []), ...flags.filter(f => !KNOWN_FLAGS.includes(f))];
if (!zip || zip.startsWith('--') || unknown.length) {
  console.error(`usage: update.mjs <kit.zip> [--dry-run] [--skip-upload]${unknown.length ? `\nunknown argument: ${unknown.join(' ')}` : ''}`);
  process.exit(2);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], {cwd: here}).toString().trim();
const BASE = 'https://dsco.code.org/assets/font-awesome-pro';
const BUCKET = 's3://cdo-dsco/assets/font-awesome-pro';
const URL_FILES = [
  'frontend/packages/component-library-styles/font.scss',
  'frontend/packages/fonts/src/fontAwesome/index.ts',
  'shared/css/font.scss',
].map(f => path.join(root, f));
const CONSTANTS_REL =
  'frontend/packages/component-library/src/fontAwesomeV6Icon/constants/index.ts';
const CONSTANTS = path.join(root, CONSTANTS_REL);
const URL_RE = /(font-awesome-pro\/)\d+(\/css)/g;
const SHEET_RE = /font-awesome-pro\/\d+\/css\/([a-z0-9-]+(?:\.min)?\.css)/g;
const SET_RE = /(new Set\(\[\n)([\s\S]*?)(\n\]\);)/;
// Any url() target that is not absolute https, data: or a fragment would ship broken.
const RELATIVE_URL_RE = /url\((?!\s*["']?(?:https:\/\/|data:|#))/;

// The self-host download leaves out the v4 compatibility files even with the kit's
// "Compatibility with Older Versions" setting on. Curriculum content still uses v4 class
// names, so they come from the Font Awesome Free release of the kit's exact version.
const FREE_RELEASE = 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome';
const V4_FILES = [
  'css/v4-shims.css',
  'css/v4-shims.min.css',
  'css/v4-font-face.css',
  'css/v4-font-face.min.css',
  'webfonts/fa-v4compatibility.woff2',
];

// Each real run needs its own S3 prefix; the dry run prints a timestamp the real run will not reuse.
const ts = Math.floor(Date.now() / 1000).toString();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-kit-'));
let keepTmp = false;

function findDir(dir, name) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    if (!e.isDirectory() || e.name === '__MACOSX') continue;
    const p = path.join(dir, e.name);
    if (e.name === name) return p;
    const hit = findDir(p, name);
    if (hit) return hit;
  }
}

// One git grep for all names (one per name is minutes on this repo), then bucket by name.
// git grep exits 0 for hits, 1 for none; anything else is a failed search, not "unused".
function usagesByName(names) {
  const alt = names.join('|');
  const re = `fa-(${alt})([^a-z0-9-]|$)|["'\`](${alt})["'\`]`;
  const r = spawnSync(
    'git',
    ['grep', '-n', '-I', '-E', re, '--', '.', `:!${CONSTANTS_REL}`, ':!.agents/skills/update-fontawesome-kit', ':!dashboard/config/locales', ':!*.lock', ':!*lock.json'],
    {cwd: root, maxBuffer: 256 * 1024 * 1024},
  );
  if (r.status !== 0 && r.status !== 1) throw new Error(`git grep failed: ${r.stderr}`);
  const lines = r.stdout.toString().trim().split('\n').filter(Boolean);
  return Object.fromEntries(
    names.map(n => {
      const one = new RegExp(`fa-${n}([^a-z0-9-]|$)|["'\`]${n}["'\`]`);
      return [n, lines.filter(l => one.test(l.replace(/^[^:]*:\d+:/, '')))];
    }),
  );
}

// The kit's own JS and CSS headers name the release ("Font Awesome Pro 7.3.1").
function kitVersion(kitRoot) {
  const candidates = [path.join(kitRoot, 'js', 'fontawesome.js'), path.join(kitRoot, 'css', 'fontawesome.css')];
  for (const f of candidates) {
    if (!fs.existsSync(f)) continue;
    const m = /Font Awesome Pro (\d+\.\d+\.\d+)/.exec(fs.readFileSync(f, 'utf8').slice(0, 2000));
    if (m) return m[1];
  }
  throw new Error('could not read the Font Awesome version from js/fontawesome.js or css/fontawesome.css');
}

async function addV4Files(css, webfonts, version) {
  if (fs.existsSync(path.join(css, 'v4-shims.min.css'))) {
    console.log('v4 compatibility: already in the kit');
    return;
  }
  for (const rel of V4_FILES) {
    const url = `${FREE_RELEASE}/${version}/${rel}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: ${res.status}`);
    const dest = path.join(rel.startsWith('css/') ? css : webfonts, path.basename(rel));
    if (rel.endsWith('.css')) {
      let text = await res.text();
      // Free names its family "Font Awesome 7 Free"; the Pro kit defines "Font Awesome 7 Pro".
      if (rel.includes('v4-shims')) text = text.replaceAll(/Font Awesome (\d+) Free/g, 'Font Awesome $1 Pro');
      fs.writeFileSync(dest, text);
    } else {
      fs.writeFileSync(dest, new Uint8Array(await res.arrayBuffer()));
    }
  }
  const shims = fs.readFileSync(path.join(css, 'v4-shims.min.css'), 'utf8');
  if (/font-family:\s*"?Font Awesome \d+ Free/.test(shims)) throw new Error('v4-shims.min.css still names the Free family');
  if (!/\.fa\.fa-[a-z]/.test(shims)) throw new Error('v4-shims.min.css has no .fa.fa-* rules');
  console.log(`v4 compatibility: added from Font Awesome Free ${version}`);
}

async function main() {
  execFileSync('unzip', ['-q', zip, '-d', tmp]);
  const css = findDir(tmp, 'css');
  const webfonts = findDir(tmp, 'webfonts');
  if (!css || !webfonts) throw new Error('zip lacks css/ or webfonts/');

  const faCss = fs.readFileSync(path.join(css, 'fontawesome.css'), 'utf8');
  const major = faCss.includes('Font Awesome 7 Pro') ? 7 : faCss.includes('Font Awesome 6 Pro') ? 6 : 0;
  if (major !== 7) {
    throw new Error(
      major === 6
        ? 'this is a Font Awesome 6 kit; the repo is on 7. Download "Code.org FontAwesome Kit v7" instead'
        : 'fontawesome.css names neither Font Awesome 7 Pro nor 6 Pro',
    );
  }
  const version = kitVersion(path.dirname(css));
  console.log(`kit: Font Awesome Pro ${version}\ntimestamp: ${ts}`);
  await addV4Files(css, webfonts, version);

  const cssFiles = fs.readdirSync(css).filter(f => f.endsWith('.css'));
  for (const f of cssFiles) {
    const p = path.join(css, f);
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('../webfonts', `${BASE}/${ts}/webfonts`));
  }
  const relative = cssFiles.filter(f => RELATIVE_URL_RE.test(fs.readFileSync(path.join(css, f), 'utf8')));
  if (relative.length) throw new Error(`non-absolute url() left in ${relative.join(', ')}`);

  // Every stylesheet the repo loads must be in the folder about to be published.
  const referenced = new Set();
  for (const f of URL_FILES) {
    const src = fs.readFileSync(f, 'utf8');
    if (!URL_RE.test(src)) throw new Error(`no font-awesome-pro URL in ${f}`);
    URL_RE.lastIndex = 0;
    for (const m of src.matchAll(SHEET_RE)) referenced.add(m[1]);
  }
  const missing = [...referenced].filter(f => !fs.existsSync(path.join(css, f)));
  if (missing.length) throw new Error(`the repo loads stylesheets this kit lacks: ${missing.join(', ')}`);

  const customPath = path.join(css, 'custom-icons.css');
  if (!fs.existsSync(customPath)) throw new Error('kit has no css/custom-icons.css');
  const customCss = fs.readFileSync(customPath, 'utf8');
  const newIcons = new Set([...customCss.matchAll(/\.fa-kit\.fa-([a-z0-9-]+)\s*[,{]/g)].map(m => m[1]));
  if (!customCss.includes(`${BASE}/${ts}/webfonts`)) {
    throw new Error('custom-icons.css does not reference the new webfonts URL');
  }
  if (newIcons.size === 0) throw new Error('parsed no icons from custom-icons.css; refusing to continue');

  const constSrc = fs.readFileSync(CONSTANTS, 'utf8');
  const setMatch = SET_RE.exec(constSrc);
  if (!setMatch) throw new Error('kitIcons set not found in constants/index.ts');
  const oldIcons = new Set([...setMatch[2].matchAll(/'([^']+)'/g)].map(m => m[1]));
  const added = [...newIcons].filter(i => !oldIcons.has(i)).sort();
  const removed = [...oldIcons].filter(i => !newIcons.has(i)).sort();
  console.log(`added: ${added.join(', ') || '-'}\nremoved: ${removed.join(', ') || '-'}`);
  if (removed.length) {
    const usages = usagesByName(removed);
    for (const name of removed) {
      const hits = usages[name];
      console.log(hits.length ? `USED: ${name} (${hits.length}):\n  ${hits.map(l => (l.length > 160 ? `${l.slice(0, 160)}...` : l)).join('\n  ')}` : `unused: ${name}`);
    }
    console.log('NOTE: "unused" is not proof. The search misses class names built at runtime (fa-${x}).');
  }

  if (dry) {
    console.log(`dry run: would sync to ${BUCKET}/<new timestamp>/ and edit:\n  ${[...URL_FILES, CONSTANTS].join('\n  ')}`);
    return;
  }

  if (!skipUpload) {
    const who = spawnSync('aws', ['sts', 'get-caller-identity', '--query', 'Arn', '--output', 'text']);
    if (who.status !== 0) throw new Error(`aws sts get-caller-identity failed: ${who.stderr}`);
    console.log(`uploading as ${who.stdout.toString().trim()}`);
    // s3 ls exits 1 with no output for an empty prefix; any other failure is an error, not "free".
    const ls = spawnSync('aws', ['s3', 'ls', `${BUCKET}/${ts}/`]);
    if (ls.status === 0 && ls.stdout.toString().trim()) {
      throw new Error(`${BUCKET}/${ts}/ already has files; rerun in a second`);
    }
    if (ls.status !== 0 && ls.status !== 1) throw new Error(`aws s3 ls failed: ${ls.stderr}`);
    for (const d of [css, webfonts]) {
      execFileSync('aws', ['s3', 'sync', d, `${BUCKET}/${ts}/${path.basename(d)}/`], {stdio: 'inherit'});
    }
  } else {
    keepTmp = true;
    console.log(`--skip-upload: upload these two directories by hand (check the target prefix is empty first):\n  ${css} -> ${BUCKET}/${ts}/css/\n  ${webfonts} -> ${BUCKET}/${ts}/webfonts/`);
  }

  for (const f of URL_FILES) {
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(URL_RE, `$1${ts}$2`));
  }
  const body = [...newIcons].sort().map(i => `  '${i}',`).join('\n');
  fs.writeFileSync(CONSTANTS, constSrc.replace(SET_RE, `$1${body}$3`));
  console.log('done; now verify per SKILL.md step 6');
}

try {
  await main();
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exitCode = 1;
} finally {
  if (!keepTmp) fs.rmSync(tmp, {recursive: true, force: true});
}
