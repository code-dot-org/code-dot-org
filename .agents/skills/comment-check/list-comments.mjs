#!/usr/bin/env node
// Lists the comment lines a branch adds or changes, with file and line, so
// that each one can be read. Run from anywhere inside the repo:
//
//   node .agents/skills/comment-check/list-comments.mjs [base]
//
// `base` defaults to origin/staging. Changes not yet committed are included,
// except in a file git does not track yet.
//
// The scan is by line, not by parser. It finds whole-line comments and the
// lines of block comments. It misses a comment that follows code on the
// same line.

import {execFileSync} from 'node:child_process';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const SLASH_STYLE = /\.(js|jsx|ts|tsx|mjs|cjs|scss|css)$/;
const HASH_STYLE = /\.(rb|rake|py|sh|yml|yaml)$/;

const git = (...args) =>
  execFileSync('git', args, {encoding: 'utf8', maxBuffer: 1 << 28});

const base = process.argv[2] || 'origin/staging';
const root = git('rev-parse', '--show-toplevel').trim();
const mergeBase = git('merge-base', base, 'HEAD').trim();

/** Added line numbers by file, from a diff with no context lines. */
function addedLines() {
  const diff = git('-C', root, 'diff', '--unified=0', '--no-color', mergeBase);
  const byFile = new Map();
  let file = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line.startsWith('+++ b/') ? line.slice(6) : null;
      continue;
    }
    const hunk = /^@@ -\S+ \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk && file) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      const lines = byFile.get(file) ?? new Set();
      for (let i = 0; i < count; i++) {
        lines.add(start + i);
      }
      byFile.set(file, lines);
    }
  }
  return byFile;
}

/** The numbers of the lines of `text` that are comments. */
function commentLines(file, text) {
  const found = new Set();
  const lines = text.split('\n');
  if (HASH_STYLE.test(file)) {
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
    // A block comment opens at the start of a line or after a space, brace
    // or parenthesis. A glob such as 'src/**/*.ts' does not open one.
    const open = /(^|[\s{(])\/\*/.exec(line);
    if (open) {
      const rest = line.slice(open.index + open[0].length);
      if (/^\s*(\{\s*)?\/\*/.test(line)) {
        found.add(i + 1);
      }
      inBlock = !rest.includes('*/');
    }
  });
  return found;
}

let addedTotal = 0;
let commentTotal = 0;
const report = [];
for (const [file, added] of addedLines()) {
  const absolute = path.join(root, file);
  if (
    !(SLASH_STYLE.test(file) || HASH_STYLE.test(file)) ||
    !existsSync(absolute)
  ) {
    continue;
  }
  const text = readFileSync(absolute, 'utf8');
  const lines = text.split('\n');
  const comments = commentLines(file, text);
  addedTotal += added.size;
  const hits = [...added].filter(n => comments.has(n)).sort((a, b) => a - b);
  commentTotal += hits.length;
  if (hits.length) {
    report.push(
      `\n${file}`,
      ...hits.map(n => `  ${String(n).padStart(5)}: ${lines[n - 1].trim()}`)
    );
  }
}

console.log(report.join('\n'));
console.log(
  `\n${commentTotal} comment lines in ${addedTotal} added lines` +
    ` (against ${base}, merge base ${mergeBase.slice(0, 11)}).`
);
