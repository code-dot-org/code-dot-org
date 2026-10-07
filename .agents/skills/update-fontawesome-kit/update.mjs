#!/usr/bin/env node
// Usage: node update.mjs <kit.zip> [--dry-run] [--skip-upload]
// --skip-upload edits the repo files but leaves the kit in a temp dir for a manual S3 upload.
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [zip, ...flags] = process.argv.slice(2);
const dry = flags.includes('--dry-run');
const skipUpload = flags.includes('--skip-upload');
const KNOWN_FLAGS = ['--dry-run', '--skip-upload'];
const unknown = [...(zip?.startsWith('--') ? [zip] : []), ...flags.filter(f => !KNOWN_FLAGS.includes(f))];
if (!zip || zip.startsWith('--') || unknown.length) {
  console.error(`usage: update.mjs <kit.zip> [--dry-run] [--skip-upload]${unknown.length ? `\nunknown argument: ${unknown.join(' ')}` : ''}`);
  process.exit(2);
}

const root = execFileSync('git', ['rev-parse', '--show-toplevel']).toString().trim();
const BASE = 'https://dsco.code.org/assets/font-awesome-pro';
const BUCKET = 's3://cdo-dsco/assets/font-awesome-pro';
const URL_FILES = [
  'frontend/packages/component-library-styles/font.scss',
  'frontend/packages/fonts/src/loader/index.ts',
  'shared/css/font.scss',
].map(f => path.join(root, f));
const CONSTANTS_REL =
  'frontend/packages/component-library/src/fontAwesomeV6Icon/constants/index.ts';
const CONSTANTS = path.join(root, CONSTANTS_REL);
const URL_RE = /(font-awesome-pro\/)\d+(\/css)/g;
const SET_RE = /(new Set\(\[\n)[\s\S]*?(\n\]\);)/;

// Each real run needs its own S3 prefix; the dry run prints a timestamp the real run will not reuse.
const ts = Math.floor(Date.now() / 1000).toString();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-kit-'));

function findDir(dir, name) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    if (!e.isDirectory() || e.name === '__MACOSX') continue;
    const p = path.join(dir, e.name);
    if (e.name === name) return p;
    const hit = findDir(p, name);
    if (hit) return hit;
  }
}

// git grep exits 0 for hits, 1 for none; anything else is a failed search, not "unused".
function usagesOf(name) {
  const re = `fa-${name}([^a-z0-9-]|$)|["'\`]${name}["'\`]`;
  const r = spawnSync(
    'git',
    ['grep', '-n', '-I', '-E', re, '--', '.', `:!${CONSTANTS_REL}`, ':!dashboard/config/locales', ':!*.lock', ':!*lock.json'],
    {cwd: root},
  );
  if (r.status !== 0 && r.status !== 1) {
    throw new Error(`git grep failed for ${name}: ${r.stderr}`);
  }
  const out = r.stdout.toString().trim();
  return out ? out.split('\n') : [];
}

function main() {
  execFileSync('unzip', ['-q', zip, '-x', '__MACOSX/*', '-d', tmp]);
  const css = findDir(tmp, 'css');
  const webfonts = findDir(tmp, 'webfonts');
  if (!css || !webfonts) throw new Error('zip lacks css/ or webfonts/');

  const cssFiles = fs.readdirSync(css).filter(f => f.endsWith('.css'));
  for (const f of cssFiles) {
    const p = path.join(css, f);
    fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replaceAll('../webfonts', `${BASE}/${ts}/webfonts`));
  }
  const relative = cssFiles.filter(f => /url\(["']?\.{1,2}\//.test(fs.readFileSync(path.join(css, f), 'utf8')));
  if (relative.length) throw new Error(`relative url() left in ${relative.join(', ')}`);

  const faCss = fs.readFileSync(path.join(css, 'fontawesome.css'), 'utf8');
  const major = faCss.includes('Font Awesome 6 Pro') ? 6 : faCss.includes('Font Awesome 7 Pro') ? 7 : 0;
  if (!major) throw new Error('fontawesome.css names neither Font Awesome 6 Pro nor 7 Pro');
  // The repo is on v6. A v7 kit is only archived in S3; no repo file points at it.
  const archiveOnly = major === 7;
  console.log(`kit: Font Awesome ${major}${archiveOnly ? ' (archive only, repo files untouched)' : ''}\ntimestamp: ${ts}`);

  let newIcons = new Set();
  const customPath = path.join(css, 'custom-icons.css');
  if (!archiveOnly || fs.existsSync(customPath)) {
    const customCss = fs.readFileSync(customPath, 'utf8');
    newIcons = new Set([...customCss.matchAll(/\.fa-kit\.fa-([a-z0-9-]+)\s*[,{]/g)].map(m => m[1]));
    if (!customCss.includes(`${BASE}/${ts}/webfonts`)) {
      throw new Error('custom-icons.css does not reference the new webfonts URL');
    }
  }
  if (!archiveOnly && newIcons.size === 0) {
    throw new Error('parsed no icons from custom-icons.css; refusing to continue');
  }

  let constSrc = '';
  if (!archiveOnly) {
    constSrc = fs.readFileSync(CONSTANTS, 'utf8');
    if (!SET_RE.test(constSrc)) throw new Error('kitIcons set not found in constants/index.ts');
    for (const f of URL_FILES) {
      if (!URL_RE.test(fs.readFileSync(f, 'utf8'))) throw new Error(`no font-awesome-pro URL in ${f}`);
      URL_RE.lastIndex = 0;
    }
    const oldIcons = new Set([...constSrc.matchAll(/^\s+'([^']+)',$/gm)].map(m => m[1]));
    const added = [...newIcons].filter(i => !oldIcons.has(i)).sort();
    const removed = [...oldIcons].filter(i => !newIcons.has(i)).sort();
    console.log(`added: ${added.join(', ') || '-'}\nremoved: ${removed.join(', ') || '-'}`);
    for (const name of removed) {
      const hits = usagesOf(name);
      console.log(hits.length ? `USED: ${name} (${hits.length}):\n  ${hits.slice(0, 10).join('\n  ')}` : `unused: ${name}`);
    }
    if (removed.length) {
      console.log('NOTE: "unused" is not proof. The search covers tracked files (minus locales and lockfiles) and misses class names built at runtime (fa-${x}).');
    }
  } else {
    console.log('added/removed: n/a (archive only)');
  }

  if (dry) {
    console.log(`dry run: would sync to ${BUCKET}/<new timestamp>/` + (archiveOnly ? '' : ` and edit:\n  ${[...URL_FILES, CONSTANTS].join('\n  ')}`));
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
    console.log(`--skip-upload: files are in ${tmp}; upload css/ and webfonts/ to ${BUCKET}/${ts}/ by hand`);
  }

  if (archiveOnly) {
    console.log(`v7 URL prefix: ${BASE}/${ts}/`);
    return;
  }

  for (const f of URL_FILES) {
    fs.writeFileSync(f, fs.readFileSync(f, 'utf8').replace(URL_RE, `$1${ts}$2`));
  }
  const body = [...newIcons].sort().map(i => `  '${i}',`).join('\n');
  fs.writeFileSync(CONSTANTS, constSrc.replace(SET_RE, `$1${body}$2`));
  console.log('done; now verify per SKILL.md step 6');
}

try {
  main();
} finally {
  if (!skipUpload || dry) fs.rmSync(tmp, {recursive: true, force: true});
}
