#!/usr/bin/env node
// Validates a pathway JSON with the zod schema itself, fetched from GitHub,
// so the skill keeps no copy of the format.
//
// usage: node validate_pathway.mjs PATHWAY.json
//
// Fetches apps/src/adaptive/schema and its one runtime helper from branch
// staging of code-dot-org/code-dot-org (or REPO_REF), bundles them with the
// zod version apps/yarn.lock pins, and runs the calls contentFilesTest.ts
// makes in CI. Prints {"problems": [...]} or {"skipped": "<reason>"} as one
// line of JSON. The bundle is cached per commit, and zod and esbuild once,
// under ~/.cache/adaptive-level-builder/zod.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';

const OWNER_REPO = 'code-dot-org/code-dot-org';
const REF = process.env.REPO_REF || 'staging';
const SCHEMA_DIR = 'apps/src/adaptive/schema';
// The schema's only runtime import outside its own directory.
const HELPERS = ['apps/src/lab2/utils/coerceStringBooleans.ts'];
// esbuild only strips types here, so its version does not matter much.
const ESBUILD_VERSION = '0.25.10';
const CACHE = path.join(os.homedir(), '.cache', 'adaptive-level-builder', 'zod');
const REF_TTL_MS = 3600 * 1000;

function token() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    return execFileSync('gh', ['auth', 'token'], {encoding: 'utf8', timeout: 10000, stdio: ['ignore', 'pipe', 'ignore']}).trim() || null;
  } catch {
    return null;
  }
}

async function get(url, api = false) {
  const headers = {'User-Agent': 'adaptive-level-builder'};
  if (api) {
    headers.Accept = 'application/vnd.github+json';
    const t = token();
    if (t) headers.Authorization = `Bearer ${t}`;
  }
  const response = await fetch(url, {headers});
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.text();
}

async function commitOf(ref) {
  const cached = path.join(CACHE, 'refs', `${ref.replace(/\//g, '_')}.txt`);
  try {
    if (Date.now() - fs.statSync(cached).mtimeMs < REF_TTL_MS) return fs.readFileSync(cached, 'utf8').trim();
  } catch {
    // Not cached yet.
  }
  const commit = JSON.parse(await get(`https://api.github.com/repos/${OWNER_REPO}/commits/${encodeURIComponent(ref)}`, true));
  fs.mkdirSync(path.dirname(cached), {recursive: true});
  fs.writeFileSync(cached, commit.sha);
  return commit.sha;
}

async function raw(sha, file) {
  return get(`https://raw.githubusercontent.com/${OWNER_REPO}/${sha}/${file}`);
}

async function fetchSources(sha, srcDir) {
  const tree = JSON.parse(await get(
    `https://api.github.com/repos/${OWNER_REPO}/git/trees/${encodeURIComponent(`${sha}:${SCHEMA_DIR}`)}?recursive=1`, true));
  const files = tree.tree.filter(e => e.type === 'blob' && /\.tsx?$/.test(e.path)).map(e => `${SCHEMA_DIR}/${e.path}`);
  if (!files.length) throw new Error(`no schema files under ${SCHEMA_DIR} at ${sha}`);
  for (const file of [...files, ...HELPERS]) {
    const out = path.join(srcDir, file);
    fs.mkdirSync(path.dirname(out), {recursive: true});
    fs.writeFileSync(out, await raw(sha, file));
  }
}

async function zodVersion(sha) {
  const lock = await raw(sha, 'apps/yarn.lock');
  const m = /^"zod@npm:[^"]*":\n\s+version: (\S+)/m.exec(lock);
  if (!m) throw new Error('apps/yarn.lock pins no zod version');
  return m[1];
}

function install(zod) {
  const dir = path.join(CACHE, 'deps', `zod-${zod}-esbuild-${ESBUILD_VERSION}`);
  if (!fs.existsSync(path.join(dir, 'node_modules', 'zod', 'package.json'))) {
    fs.mkdirSync(dir, {recursive: true});
    execFileSync('npm', ['install', '--prefix', dir, '--no-audit', '--no-fund', '--no-save', '--silent',
      `zod@${zod}`, `esbuild@${ESBUILD_VERSION}`], {stdio: ['ignore', 'ignore', 'pipe'], timeout: 300000});
  }
  return path.join(dir, 'node_modules');
}

// Mirrors contentFilesTest.ts: the source must parse, then compose into a
// served pathway whose references hold. fakeResolve stands in for the server
// as that test's does.
const ENTRY = `
import {parsePathway, parsePathwaySource} from './${SCHEMA_DIR}/parse';

function fakeResolve(source: any): unknown {
  const skills = Object.fromEntries(
    Object.entries(source.skills).map(([id, skill]: [string, any]) => [
      id,
      {
        ...skill,
        standards: skill.standards?.map((ref: any) => ({
          ...ref,
          frameworkName: 'Fake Framework',
          description: 'Standard ' + ref.shortcode,
        })),
      },
    ])
  );
  return {...source, skills};
}

function problemsOf(error: any): string[] {
  if (error && Array.isArray(error.problems)) return error.problems;
  throw error;
}

export function validate(raw: unknown, expectedId: string): string[] {
  let source: any;
  try {
    source = parsePathwaySource(raw);
  } catch (error) {
    return problemsOf(error);
  }
  const problems: string[] = [];
  if (source.id !== expectedId) {
    problems.push("id '" + source.id + "' does not match the file name '" + expectedId + "'");
  }
  try {
    parsePathway(fakeResolve(source));
  } catch (error) {
    problems.push(...problemsOf(error));
  }
  return problems;
}
`;

// @cdo/apps/x resolves to the fetched apps/src/x. A module that was not
// fetched is only imported for its types, which esbuild strips, so it may be
// empty.
function cdoAppsPlugin(srcDir) {
  return {
    name: 'cdo-apps',
    setup(build) {
      build.onResolve({filter: /^@cdo\/apps\//}, args => {
        const base = path.join(srcDir, 'apps', 'src', args.path.slice('@cdo/apps/'.length));
        for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), base]) {
          if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return {path: candidate};
        }
        return {path: args.path, namespace: 'cdo-types-only'};
      });
      build.onLoad({filter: /.*/, namespace: 'cdo-types-only'}, () => ({contents: 'export {};', loader: 'js'}));
    },
  };
}

async function bundle(sha) {
  const dir = path.join(CACHE, sha);
  const out = path.join(dir, 'bundle.mjs');
  if (fs.existsSync(out)) return out;
  const srcDir = path.join(dir, 'src');
  fs.rmSync(dir, {recursive: true, force: true});
  await fetchSources(sha, srcDir);
  const modules = install(await zodVersion(sha));
  const esbuild = await import(pathToFileURL(path.join(modules, 'esbuild', 'lib', 'main.js')).href);
  const entry = path.join(srcDir, 'entry.ts');
  fs.writeFileSync(entry, ENTRY);
  const tmp = `${out}.${process.pid}.tmp`;
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: tmp,
    nodePaths: [modules],
    plugins: [cdoAppsPlugin(srcDir)],
    logLevel: 'silent',
  });
  fs.renameSync(tmp, out);
  return out;
}

async function main() {
  const file = process.argv[2];
  if (!file || process.argv.length !== 3) {
    process.stderr.write('usage: node validate_pathway.mjs PATHWAY.json\n');
    process.exit(2);
  }
  let out;
  try {
    out = await bundle(await commitOf(REF));
  } catch (error) {
    console.log(JSON.stringify({skipped: `could not build the schema from ${REF}: ${error.message}`}));
    return;
  }
  const {validate} = await import(pathToFileURL(out).href);
  const rawJson = JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(JSON.stringify({problems: validate(rawJson, path.basename(file, '.json'))}));
}

main();
