#!/usr/bin/env node
// Lists the comment lines that the checked-out branch adds or changes, with
// file and line, so that each one can be read. Run it inside the repo:
//
//   node .agents/skills/comment-check/list-comments.mjs [base]
//
// Each line is matched against a pattern; the files are not parsed. In a
// file with "//" comments it finds whole-line comments and block comments.
// In a file with "#" comments it finds whole-line comments only. It misses
// a comment that follows code on the same line, and it can list a line of
// a string that looks like a comment.

import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const DEFAULT_BASE = 'origin/staging';
const SLASH_COMMENT_FILES = /\.(js|jsx|ts|tsx|mjs|cjs|scss|css)$/;
const HASH_COMMENT_FILES = /(\.(rb|rake|py|sh|yml|yaml|feature)|\/?(Rakefile|Gemfile))$/;
// Documents, data and pictures, which have no code comments to list.
const NOT_CODE_FILES = /\.(md|json|svg|png|gif|jpg|jpeg|csv|txt|lock|level)$/;

const git = (...args) =>
  execFileSync('git', args, {
    encoding: 'utf8',
    maxBuffer: 1 << 28,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

const base = process.argv[2] || DEFAULT_BASE;
let root;
let mergeBase;
try {
  root = git('rev-parse', '--show-toplevel').trim();
  mergeBase = git('merge-base', base, 'HEAD').trim();
} catch {
  console.error(
    `Cannot compare with "${base}". Run this inside the repo, with a base` +
      ' that exists (try `git fetch origin`).'
  );
  process.exit(1);
}

// Files not yet tracked by git are left out; changes not yet committed to
// tracked files are included.
const changedFiles = git(
  '-C',
  root,
  'diff',
  '--name-only',
  '--no-renames',
  '--diff-filter=AM',
  '-z',
  mergeBase
)
  .split('\0')
  .filter(Boolean);

function addedLineNumbers(file) {
  const diff = git(
    '-C',
    root,
    'diff',
    '--unified=0',
    '--no-color',
    '--no-ext-diff',
    '--no-renames',
    mergeBase,
    '--',
    file
  );
  const added = new Set();
  for (const line of diff.split('\n')) {
    const hunk = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      for (let i = 0; i < count; i++) {
        added.add(start + i);
      }
    }
  }
  return added;
}

function commentLineNumbers(file, lines) {
  const found = new Set();
  if (HASH_COMMENT_FILES.test(file)) {
    lines.forEach((line, i) => {
      if (/^\s*#(?!!)/.test(line)) {
        found.add(i + 1);
      }
    });
    return found;
  }
  let inBlock = false;
  lines.forEach((line, i) => {
    if (inBlock) {
      found.add(i + 1);
      inBlock = !line.includes('*/');
      return;
    }
    if (/^\s*\/\//.test(line)) {
      found.add(i + 1);
      return;
    }
    // "/*" starts a block comment here only at the start of a line or after
    // a space, "{" or "(", so that a glob such as 'src/**/*.ts' does not.
    const open = /(^|[\s{(])\/\*/.exec(line);
    if (open) {
      if (/^\s*(\{\s*)?\/\*/.test(line)) {
        found.add(i + 1);
      }
      const afterOpen = line.slice(open.index + open[0].length);
      inBlock = !afterOpen.includes('*/');
    }
  });
  return found;
}

let commentTotal = 0;
let filesWithComments = 0;
const notScanned = [];
for (const file of changedFiles) {
  const absolute = path.join(root, file);
  if (!existsSync(absolute)) {
    continue;
  }
  if (NOT_CODE_FILES.test(file)) {
    continue;
  }
  if (!(SLASH_COMMENT_FILES.test(file) || HASH_COMMENT_FILES.test(file))) {
    notScanned.push(file);
    continue;
  }
  const lines = readFileSync(absolute, 'utf8').split('\n');
  const comments = commentLineNumbers(file, lines);
  const hits = [...addedLineNumbers(file)]
    .filter(n => comments.has(n))
    .sort((a, b) => a - b);
  if (hits.length) {
    commentTotal += hits.length;
    filesWithComments += 1;
    console.log(`\n${file}`);
    for (const n of hits) {
      console.log(`  ${String(n).padStart(5)}: ${lines[n - 1].trim()}`);
    }
  }
}

console.log(
  `\nComment lines added or changed, against ${base}: ${commentTotal},` +
    ` in ${filesWithComments} file(s).`
);
if (notScanned.length) {
  console.log(
    `Changed files of other types, not scanned: ${notScanned.join(', ')}`
  );
}
