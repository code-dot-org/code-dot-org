#!/usr/bin/env node
// Usage: node update.mjs <kit.zip> [--dry-run] [--skip-upload]
// --skip-upload edits the repo files but does not touch S3 (the upload step is untested).
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [zip, ...flags] = process.argv.slice(2);
const dry = flags.includes('--dry-run');
const skipUpload = flags.includes('--skip-upload');
if (!zip) {
  console.error('usage: update.mjs <kit.zip> [--dry-run] [--skip-upload]');
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

const ts = Math.floor(Date.now() / 1000).toString();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'fa-kit-'));
execFileSync('unzip', ['-q', zip, '-d', tmp]);

// The zip nests css/ and webfonts/ under a single folder.
function findDir(dir, name) {
  for (const e of fs.readdirSync(dir, {withFileTypes: true})) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.name === name) return p;
    const hit = findDir(p, name);
    if (hit) return hit;
  }
}
const css = findDir(tmp, 'css');
const webfonts = findDir(tmp, 'webfonts');
if (!css || !webfonts) throw new Error('zip lacks css/ or webfonts/');

for (const f of fs.readdirSync(css)) {
  const p = path.join(css, f);
  const s = fs.readFileSync(p, 'utf8').replaceAll('../webfonts', `${BASE}/${ts}/webfonts`);
  fs.writeFileSync(p, s);
}

const faCss = fs.readFileSync(path.join(css, 'fontawesome.css'), 'utf8');
const major = faCss.includes('Font Awesome 6 Pro') ? 6 : faCss.includes('Font Awesome 7 Pro') ? 7 : 0;
if (!major) throw new Error('fontawesome.css names neither Font Awesome 6 Pro nor 7 Pro');
// The repo is on v6. A v7 kit is only archived in S3; no repo file points at it.
const archiveOnly = major === 7;

const customCss = fs.readFileSync(path.join(css, 'custom-icons.css'), 'utf8');
const newIcons = new Set(
  [...customCss.matchAll(/\.fa-kit\.fa-([a-z0-9-]+)\s*[,{]/g)].map(m => m[1]),
);
const constSrc = fs.readFileSync(CONSTANTS, 'utf8');
const oldIcons = new Set([...constSrc.matchAll(/^\s+'([^']+)',$/gm)].map(m => m[1]));
const added = [...newIcons].filter(i => !oldIcons.has(i)).sort();
const removed = [...oldIcons].filter(i => !newIcons.has(i)).sort();
console.log(`kit: Font Awesome ${major}${archiveOnly ? ' (archive only, repo files untouched)' : ''}\ntimestamp: ${ts}\nadded: ${added.join(', ') || '-'}\nremoved: ${removed.join(', ') || '-'}`);
// Matches the CSS class (fa-NAME) and the bare quoted name (iconName="NAME").
const SEARCH_DIRS = ['apps/src', 'frontend', 'dashboard/app', 'shared', 'pegasus'];
function usagesOf(name) {
  const re = `fa-${name}([^a-z0-9-]|$)|["']${name}["']`;
  const out = spawnSync(
    'git',
    ['grep', '-n', '-I', '-E', re, '--', ...SEARCH_DIRS, `:!${CONSTANTS_REL}`],
    {cwd: root},
  ).stdout.toString().trim();
  return out ? out.split('\n') : [];
}
if (!archiveOnly) {
  for (const name of removed) {
    const hits = usagesOf(name);
    console.log(
      hits.length
        ? `USED: ${name} (${hits.length}):\n  ${hits.slice(0, 10).join('\n  ')}`
        : `unused: ${name}`,
    );
  }
  if (removed.length) {
    console.log(
      `NOTE: "unused" is not proof. The search misses class names built at runtime (fa-\${x}) and usages in dashboard/config curriculum data, and covers only ${SEARCH_DIRS.join(', ')}.`,
    );
  }
}

if (!archiveOnly && newIcons.size === 0) throw new Error('parsed no icons from custom-icons.css; refusing to continue');

if (dry) {
  console.log(`dry run: would sync to ${BUCKET}/${ts}/` + (archiveOnly ? '' : ' and edit'), archiveOnly ? '' : [...URL_FILES, CONSTANTS]);
  process.exit(0);
}

if (!skipUpload) {
  const taken = spawnSync('aws', ['s3', 'ls', `${BUCKET}/${ts}/`]).stdout?.toString().trim();
  if (taken) throw new Error(`${BUCKET}/${ts}/ already has files; rerun in a second`);
}

if (skipUpload) {
  console.log(`--skip-upload: files are in ${tmp}; upload css/ and webfonts/ to ${BUCKET}/${ts}/ by hand`);
} else {
  for (const d of [css, webfonts]) {
    execFileSync('aws', ['s3', 'sync', d, `${BUCKET}/${ts}/${path.basename(d)}/`], {stdio: 'inherit'});
  }
}

if (archiveOnly) {
  console.log(`uploaded; v7 URL prefix: ${BASE}/${ts}/`);
  process.exit(0);
}

for (const f of URL_FILES) {
  const s = fs.readFileSync(f, 'utf8').replace(/(font-awesome-pro\/)\d+(\/css)/g, `$1${ts}$2`);
  fs.writeFileSync(f, s);
}

const body = [...newIcons].sort().map(i => `  '${i}',`).join('\n');
fs.writeFileSync(
  CONSTANTS,
  constSrc.replace(/(new Set\(\[\n)[\s\S]*?(\n\]\);)/, `$1${body}$2`),
);
console.log('done; now verify per SKILL.md step 4');
