import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import {
  addRemote,
  commitFilesOnto,
  deleteRemoteBranch,
  diffStat,
  discoverDefaultBranch,
  fetchShallowBranch,
  initBareScratchRepo,
  listDirNames,
  parseGithubOwnerRepo,
  pushCommit,
  readFileAtRef,
  refExists,
  removeScratchRepo,
  remoteOwner,
  remoteOwnerRepo,
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

/** A bare repo standing in for a "real remote" during a test — with a
 * `main` branch (not `master`), so `discoverDefaultBranch` has something
 * non-default to actually discover. */
function makeBareRemote(): string {
  const repoRoot = makeRepo();
  git(repoRoot, ['branch', '-m', 'main']);
  const bareDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-plumbing-bare-'));
  scratchDirs.push(bareDir);
  git(bareDir, ['init', '--bare', '--quiet']);
  git(repoRoot, ['remote', 'add', 'bare', bareDir]);
  git(repoRoot, ['push', 'bare', 'main']);
  // A bare `init` leaves HEAD pointing at `init.defaultBranch` regardless of
  // what gets pushed later — a real GitHub repo's default branch is always
  // explicit, so the fixture must be too, or ls-remote --symref has nothing
  // to report.
  git(bareDir, ['symbolic-ref', 'HEAD', 'refs/heads/main']);
  return bareDir;
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
    expect(resolveRef(repoRoot, 'HEAD')).toBe(headBefore);
    expect(git(repoRoot, ['status', '--porcelain'])).toBe(statusBefore);
    expect(fs.existsSync(path.join(repoRoot, 'widgets'))).toBe(false);

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

describe('pushCommit + remoteOwner/remoteOwnerRepo', () => {
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

    expect(remoteOwner(repoRoot, 'test-remote')).toBeUndefined();
    expect(remoteOwnerRepo(repoRoot, 'test-remote')).toBeUndefined();
  });

  it('parses the owner and repo out of a github.com SSH remote URL', () => {
    const repoRoot = makeRepo();
    git(repoRoot, [
      'remote',
      'add',
      'fork',
      'git@github.com:someuser/code-dot-org.git',
    ]);
    expect(remoteOwner(repoRoot, 'fork')).toBe('someuser');
    expect(remoteOwnerRepo(repoRoot, 'fork')).toEqual({
      owner: 'someuser',
      repo: 'code-dot-org',
    });
  });

  it('deletes a pushed branch on the remote', () => {
    const repoRoot = makeRepo();
    const bareRemote = fs.mkdtempSync(path.join(os.tmpdir(), 'git-plumbing-bare-'));
    scratchDirs.push(bareRemote);
    git(bareRemote, ['init', '--bare', '--quiet']);
    git(repoRoot, ['remote', 'add', 'test-remote', bareRemote]);
    const {commit} = commitFilesOnto(repoRoot, 'HEAD', [], 'noop');
    pushCommit(repoRoot, 'test-remote', commit, 'widget/demo-v1.0.0');
    expect(refExists(bareRemote, 'refs/heads/widget/demo-v1.0.0')).toBe(true);

    deleteRemoteBranch(repoRoot, 'test-remote', 'widget/demo-v1.0.0');

    expect(refExists(bareRemote, 'refs/heads/widget/demo-v1.0.0')).toBe(false);
  });
});

describe('parseGithubOwnerRepo', () => {
  it('parses an SSH URL', () => {
    expect(parseGithubOwnerRepo('git@github.com:codeai-staff-apps/widgets.git')).toEqual(
      {owner: 'codeai-staff-apps', repo: 'widgets'},
    );
  });

  it('parses an HTTPS URL with no trailing .git', () => {
    expect(parseGithubOwnerRepo('https://github.com/codeai-staff-apps/widgets')).toEqual(
      {owner: 'codeai-staff-apps', repo: 'widgets'},
    );
  });

  it('returns undefined for a non-github URL', () => {
    expect(parseGithubOwnerRepo('/tmp/some/local/bare/repo')).toBeUndefined();
  });
});

describe('scratch clone + remote discovery', () => {
  it('discovers the default branch and fetches its tip shallow into a scratch bare repo', () => {
    const bareRemote = makeBareRemote();
    const remoteTip = git(bareRemote, ['rev-parse', 'main']);

    const defaultBranch = discoverDefaultBranch(bareRemote);
    expect(defaultBranch).toBe('main');

    const scratchDir = initBareScratchRepo();
    scratchDirs.push(scratchDir);
    addRemote(scratchDir, 'origin', bareRemote);
    fetchShallowBranch(scratchDir, 'origin', defaultBranch);

    expect(resolveRef(scratchDir, defaultBranch)).toBe(remoteTip);
    // Shallow: only the one commit, not the whole history.
    expect(
      git(scratchDir, ['rev-list', '--count', defaultBranch]),
    ).toBe('1');

    removeScratchRepo(scratchDir);
    expect(fs.existsSync(scratchDir)).toBe(false);
  });
});

describe('readFileAtRef', () => {
  it('reads a file at a ref, and returns undefined for a path that does not exist there', () => {
    const repoRoot = makeRepo();
    expect(readFileAtRef(repoRoot, 'HEAD', 'README.md')).toBe('hello\n');
    expect(readFileAtRef(repoRoot, 'HEAD', 'widgets/manifest.json')).toBeUndefined();
  });
});

describe('listDirNames', () => {
  it('lists immediate subdirectory names, and [] when the parent path does not exist', () => {
    const repoRoot = makeRepo();
    const {commit} = commitFilesOnto(
      repoRoot,
      'HEAD',
      [
        {path: 'widgets/alpha/widget.json', content: '{}\n'},
        {path: 'widgets/beta/widget.json', content: '{}\n'},
        {path: 'widgets/manifest.json', content: '{}\n'},
      ],
      'seed widgets',
    );
    expect(listDirNames(repoRoot, commit, 'widgets')).toEqual(['alpha', 'beta']);
    expect(listDirNames(repoRoot, commit, 'apps')).toEqual([]);
    expect(listDirNames(repoRoot, 'HEAD', 'widgets')).toEqual([]);
  });
});
