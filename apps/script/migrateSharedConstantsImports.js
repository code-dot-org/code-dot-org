#!/usr/bin/env node
//
// One-off migration for the shared constants move. It points apps imports at
// the committed @code-dot-org/shared-constants package instead of the file the
// Ruby generator writes into apps. Frontend packages can then read the
// constants without an apps build. sharedConstantsImportsTransform.js does the
// rewrite. Delete both files when the move is done.
//
// Run: node apps/script/migrateSharedConstantsImports.js

const {execFileSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const OLD_SPECIFIER = '@cdo/generated-scripts/sharedConstants';

// The version is pinned because an unpinned npx picks up whatever is current,
// and this rewrite has to stay reproducible.
const JSCODESHIFT = 'jscodeshift@17.4.0';

// apps/tasks/messages.js reads the generated file through a relative require at
// build time, so it must keep the old path. Only these two trees change.
const ROOTS = ['src', 'test'];
const EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx']);

// This test reads the constants through both specifiers and compares them, so
// it must keep the old one.
const SKIPPED = new Set(['test/unit/sharedConstantsTest.js']);

const APPS_DIR = path.resolve(__dirname, '..');
const TRANSFORM = path.join(__dirname, 'sharedConstantsImportsTransform.js');
const ESLINT = path.join(APPS_DIR, 'node_modules', '.bin', 'eslint');

function* sourceFiles(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* sourceFiles(full);
    } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
      yield full;
    }
  }
}

function readsOldSpecifier(file) {
  return fs.readFileSync(file, 'utf8').includes(OLD_SPECIFIER);
}

const targets = [];
for (const root of ROOTS) {
  for (const file of sourceFiles(path.join(APPS_DIR, root))) {
    if (SKIPPED.has(path.relative(APPS_DIR, file))) {
      continue;
    }
    if (readsOldSpecifier(file)) {
      targets.push(file);
    }
  }
}

if (targets.length > 0) {
  execFileSync(
    'npx',
    [
      '--yes',
      JSCODESHIFT,
      '--transform',
      TRANSFORM,
      '--parser',
      'tsx',
      ...targets,
    ],
    {cwd: APPS_DIR, stdio: 'inherit'}
  );
}

// The transform leaves the moved import where eslint can sort it, so the run
// below settles the final order and spacing.
const changed = targets.filter(file => !readsOldSpecifier(file));

console.log(
  `Rewrote ${OLD_SPECIFIER} to @code-dot-org/shared-constants in ${changed.length} file(s).`
);

if (changed.length > 0) {
  try {
    execFileSync(ESLINT, ['--fix', ...changed], {
      cwd: APPS_DIR,
      stdio: 'inherit',
    });
  } catch {
    console.error('eslint left problems that it cannot fix. See above.');
    process.exitCode = 1;
  }
}
