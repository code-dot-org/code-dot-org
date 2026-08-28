import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import {
  commitFilesOnto,
  diffStat,
  pushCommit,
  refExists,
  remoteOwner,
  resolveRef,
} from '../gitPlumbing.js';

const scratchDirs: string[] = [];

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function git(cwd: string, args: string[]): string {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function makeRepo(): string {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'git-plumbing-repo-'));
  scratchDirs.push(repoRoot);
  git(repoRoot, ['init', '--quiet']);
  git(repoRoot, ['config', 'user.email', 'test@example.com']);
  git(repoRoot, ['config', 'user.name', 'Test']);
  fs.writeFileSync(path.join(repoRoot, 'README.md'), 'hello\n');
  git(repoRoot, ['add', '-A']);
  git(repoRoot, ['commit', '--quiet', '-m', 'initial']);
  return repoRoot;
}

describe('resolveRef / refExists', () => {
  it('resolves HEAD and rejects a nonexistent ref', () => {
    const repoRoot = makeRepo();
    expect(refExists(repoRoot, 'HEAD')).toBe(true);
    expect(refExists(repoRoot, 'refs/heads/does-not-exist')).toBe(false);
    expect(resolveRef(repoRoot, 'HEAD')).toMatch(/^[0-9a-f]{40}$/);
  });
});

describe('commitFilesOnto', () => {
  it('builds a commit with the new files, leaving HEAD and the working tree untouched', () => {
    const repoRoot = makeRepo();
    const headBefore = resolveRef(repoRoot, 'HEAD');
    const statusBefore = git(repoRoot, ['status', '--porcelain']);

    const {baseCommit, commit} = commitFilesOnto(
      repoRoot,
      'HEAD',
      [
        {path: 'widgets/demo/widget.json', content: '{"a":1}\n'},
        {path: 'widgets/demo/src/index.ts', content: 'export const x = 1;\n'},
      ],
      'Add demo widget',
    );

    expect(baseCommit).toBe(headBefore);
    expect(commit).not.toBe(headBefore);
    // Neither HEAD nor the working tree moved.
    expect(resolveRef(repoRoot, 'HEAD')).toBe(headBefore);
    expect(git(repoRoot, ['status', '--porcelain'])).toBe(statusBefore);
    expect(fs.existsSync(path.join(repoRoot, 'widgets'))).toBe(false);

    // The new commit really does contain the files, as git objects.
    const files = git(repoRoot, ['ls-tree', '-r', '--name-only', commit])
      .split('\n')
      .sort();
    expect(files).toEqual([
      'README.md',
      'widgets/demo/src/index.ts',
      'widgets/demo/widget.json',
    ]);
    expect(git(repoRoot, ['show', `${commit}:widgets/demo/widget.json`])).toBe(
      '{"a":1}',
    );
  });

  it('carries over unrelated existing files from the base tree', () => {
    const repoRoot = makeRepo();
    const {commit} = commitFilesOnto(
      repoRoot,
      'HEAD',
      [{path: 'new-file.txt', content: 'new\n'}],
      'add new-file',
    );
    expect(git(repoRoot, ['show', `${commit}:README.md`])).toBe('hello');
  });
});

describe('diffStat', () => {
  it('reports the added files between two commits', () => {
    const repoRoot = makeRepo();
    const before = resolveRef(repoRoot, 'HEAD');
    const {commit} = commitFilesOnto(
      repoRoot,
      'HEAD',
      [{path: 'widgets/demo/widget.json', content: '{}\n'}],
      'add widget',
    );
    const stat = diffStat(repoRoot, before, commit);
    expect(stat).toContain('widgets/demo/widget.json');
  });
});

describe('pushCommit + remoteOwner', () => {
  it('pushes a built commit to a local bare remote as a new branch', () => {
    const repoRoot = makeRepo();
    const bareRemote = fs.mkdtempSync(
      path.join(os.tmpdir(), 'git-plumbing-bare-'),
    );
    scratchDirs.push(bareRemote);
    git(bareRemote, ['init', '--bare', '--quiet']);
    git(repoRoot, ['remote', 'add', 'test-remote', bareRemote]);

    const {commit} = commitFilesOnto(
      repoRoot,
      'HEAD',
      [{path: 'widgets/demo/widget.json', content: '{}\n'}],
      'add widget',
    );
    pushCommit(repoRoot, 'test-remote', commit, 'widget-catalog/demo-v1.0.0');

    const branchTip = git(bareRemote, [
      'rev-parse',
      'refs/heads/widget-catalog/demo-v1.0.0',
    ]);
    expect(branchTip).toBe(commit);
    expect(
      git(bareRemote, ['ls-tree', '-r', '--name-only', branchTip]),
    ).toContain('widgets/demo/widget.json');

    // Pushing to a bare local path (not a github.com remote) has no owner.
    expect(remoteOwner(repoRoot, 'test-remote')).toBeUndefined();
  });

  it('parses the owner out of a github.com SSH remote URL', () => {
    const repoRoot = makeRepo();
    git(repoRoot, [
      'remote',
      'add',
      'fork',
      'git@github.com:someuser/code-dot-org.git',
    ]);
    expect(remoteOwner(repoRoot, 'fork')).toBe('someuser');
  });
});
