import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import {checkVersionBumps} from '../versionBump.js';

const scratchDirs: string[] = [];

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function git(cwd: string, args: string[]): void {
  execFileSync('git', args, {cwd, stdio: 'ignore'});
}

function writeManifest(widgetDir: string, slug: string, version: string): void {
  fs.mkdirSync(widgetDir, {recursive: true});
  fs.writeFileSync(
    path.join(widgetDir, 'widget.json'),
    JSON.stringify({slug, version}, null, 2),
  );
}

function writeSource(widgetDir: string, contents: string): void {
  const srcDir = path.join(widgetDir, 'src');
  fs.mkdirSync(srcDir, {recursive: true});
  fs.writeFileSync(path.join(srcDir, 'index.ts'), contents);
}

/** A bare repo + one package root, git-initialized with an initial commit. */
function makeRepo(): {repoRoot: string; packageRoot: string} {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'version-bump-repo-'));
  scratchDirs.push(repoRoot);
  git(repoRoot, ['init', '--quiet']);
  git(repoRoot, ['config', 'user.email', 'test@example.com']);
  git(repoRoot, ['config', 'user.name', 'Test']);
  const packageRoot = path.join(
    repoRoot,
    'frontend',
    'packages',
    'widgets-catalog',
  );
  fs.mkdirSync(packageRoot, {recursive: true});
  return {repoRoot, packageRoot};
}

function commitAll(repoRoot: string, message: string): void {
  git(repoRoot, ['add', '-A']);
  git(repoRoot, ['commit', '--quiet', '-m', message]);
}

describe('checkVersionBumps', () => {
  it('skips when the directory is not a git checkout', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'not-a-repo-'));
    scratchDirs.push(dir);
    const result = checkVersionBumps(dir, ['some-widget'], {
      'some-widget': '1.0.0',
    });
    expect(result.skipped).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('skips when no usable base ref exists (single commit, no origin/staging)', () => {
    const {repoRoot, packageRoot} = makeRepo();
    const widgetDir = path.join(packageRoot, 'widgets', 'my-widget');
    writeSource(widgetDir, 'export const x = 1;');
    writeManifest(widgetDir, 'my-widget', '1.0.0');
    commitAll(repoRoot, 'initial');

    const result = checkVersionBumps(packageRoot, ['my-widget'], {
      'my-widget': '1.0.0',
    });
    expect(result.skipped).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it('passes when source changed and version was bumped', () => {
    const {repoRoot, packageRoot} = makeRepo();
    const widgetDir = path.join(packageRoot, 'widgets', 'my-widget');
    writeSource(widgetDir, 'export const x = 1;');
    writeManifest(widgetDir, 'my-widget', '1.0.0');
    commitAll(repoRoot, 'initial');

    writeSource(widgetDir, 'export const x = 2;');
    writeManifest(widgetDir, 'my-widget', '1.0.1');
    commitAll(repoRoot, 'bump');

    const result = checkVersionBumps(
      packageRoot,
      ['my-widget'],
      {'my-widget': '1.0.1'},
      {baseRef: 'HEAD~1'},
    );
    expect(result.skipped).toBe(false);
    expect(result.failures).toEqual([]);
  });

  it('fails when source changed but the version did not move', () => {
    const {repoRoot, packageRoot} = makeRepo();
    const widgetDir = path.join(packageRoot, 'widgets', 'my-widget');
    writeSource(widgetDir, 'export const x = 1;');
    writeManifest(widgetDir, 'my-widget', '1.0.0');
    commitAll(repoRoot, 'initial');

    writeSource(widgetDir, 'export const x = 2;');
    commitAll(repoRoot, 'unbumped change');

    const result = checkVersionBumps(
      packageRoot,
      ['my-widget'],
      {'my-widget': '1.0.0'},
      {baseRef: 'HEAD~1'},
    );
    expect(result.skipped).toBe(false);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0]).toContain('my-widget');
    expect(result.failures[0]).toContain('1.0.0');
  });

  it('does not require a bump for a widget that did not exist at the base ref', () => {
    const {repoRoot, packageRoot} = makeRepo();
    const existingDir = path.join(packageRoot, 'widgets', 'existing');
    writeSource(existingDir, 'export const x = 1;');
    writeManifest(existingDir, 'existing', '1.0.0');
    commitAll(repoRoot, 'initial');

    const newDir = path.join(packageRoot, 'widgets', 'brand-new');
    writeSource(newDir, 'export const y = 1;');
    writeManifest(newDir, 'brand-new', '1.0.0');
    commitAll(repoRoot, 'add brand-new widget');

    const result = checkVersionBumps(
      packageRoot,
      ['existing', 'brand-new'],
      {existing: '1.0.0', 'brand-new': '1.0.0'},
      {baseRef: 'HEAD~1'},
    );
    expect(result.skipped).toBe(false);
    expect(result.failures).toEqual([]);
  });

  it('does not flag a widget whose source did not change', () => {
    const {repoRoot, packageRoot} = makeRepo();
    const widgetDir = path.join(packageRoot, 'widgets', 'untouched');
    writeSource(widgetDir, 'export const x = 1;');
    writeManifest(widgetDir, 'untouched', '1.0.0');
    commitAll(repoRoot, 'initial');

    // A commit that touches nothing under this widget's src/.
    fs.writeFileSync(path.join(repoRoot, 'README.md'), 'unrelated change');
    commitAll(repoRoot, 'unrelated');

    const result = checkVersionBumps(
      packageRoot,
      ['untouched'],
      {untouched: '1.0.0'},
      {baseRef: 'HEAD~1'},
    );
    expect(result.skipped).toBe(false);
    expect(result.failures).toEqual([]);
  });
});
