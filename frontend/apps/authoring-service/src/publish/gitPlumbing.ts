import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Plumbing-only git operations for building a commit without ever touching
 * the caller's checked-out working tree, index, or HEAD (widget PR flow
 * plan, pass 4: the propose endpoint must not disturb this session's own
 * working branch). Every write here goes through a scratch index file
 * (`GIT_INDEX_FILE`, a temp file this module owns) and plumbing commands
 * (`hash-object`, `read-tree`, `update-index`, `write-tree`,
 * `commit-tree`) — none of which read or write `.git/index` or `.git/HEAD`.
 */

export interface GitFile {
  /** Path relative to the repo root. */
  path: string;
  content: string;
}

function git(
  repoRoot: string,
  args: string[],
  options: {env?: NodeJS.ProcessEnv; input?: string} = {},
): string {
  return execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: options.env,
    input: options.input,
  }).trim();
}

export function resolveRef(repoRoot: string, ref: string): string {
  return git(repoRoot, ['rev-parse', '--verify', ref]);
}

export function refExists(repoRoot: string, ref: string): boolean {
  try {
    execFileSync('git', ['rev-parse', '--verify', ref], {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds a new commit containing `files` layered onto `baseRef`'s tree.
 * `files` paths are repo-root-relative; existing entries at those paths are
 * replaced, everything else in the base tree is carried over unchanged.
 * Returns the new commit without moving any ref — the caller decides
 * whether to push it (see pushCommit) or just report it (dry-run).
 */
export function commitFilesOnto(
  repoRoot: string,
  baseRef: string,
  files: GitFile[],
  message: string,
): {baseCommit: string; tree: string; commit: string} {
  const baseCommit = resolveRef(repoRoot, baseRef);
  const scratchDir = fs.mkdtempSync(
    path.join(os.tmpdir(), 'widget-propose-index-'),
  );
  const scratchIndex = path.join(scratchDir, 'index');
  const env = {...process.env, GIT_INDEX_FILE: scratchIndex};
  try {
    git(repoRoot, ['read-tree', baseCommit], {env});
    for (const file of files) {
      const blob = git(repoRoot, ['hash-object', '-w', '--stdin'], {
        env,
        input: file.content,
      });
      git(
        repoRoot,
        ['update-index', '--add', '--cacheinfo', `100644,${blob},${file.path}`],
        {env},
      );
    }
    const tree = git(repoRoot, ['write-tree'], {env});
    const commit = git(repoRoot, [
      'commit-tree',
      tree,
      '-p',
      baseCommit,
      '-m',
      message,
    ]);
    return {baseCommit, tree, commit};
  } finally {
    fs.rmSync(scratchDir, {recursive: true, force: true});
  }
}

/** `git diff --stat` between two commits, optionally scoped to one path. */
export function diffStat(
  repoRoot: string,
  from: string,
  to: string,
  pathScope?: string,
): string {
  const args = ['diff', '--stat', from, to];
  if (pathScope) {
    args.push('--', pathScope);
  }
  return git(repoRoot, args);
}

/**
 * Pushes an already-built commit object to `branch` on `remote`, without
 * ever checking it out locally. `--no-verify` skips the client-side
 * pre-push hook: this commit was built by plumbing, never by a normal
 * `git commit` a `pre-commit` hook already ran against, and a monorepo
 * checkout that hasn't fetched every historical git-lfs blob otherwise
 * fails this push on an LFS pointer that has nothing to do with the
 * widget being pushed (observed while verifying this against a local
 * bare-repo remote).
 */
export function pushCommit(
  repoRoot: string,
  remote: string,
  commit: string,
  branch: string,
): void {
  git(repoRoot, [
    'push',
    '--no-verify',
    remote,
    `${commit}:refs/heads/${branch}`,
  ]);
}

/**
 * Best-effort `owner` out of a remote's `git@github.com:owner/repo.git` (or
 * `https://github.com/owner/repo`) URL, for building a compare link.
 * Returns undefined for anything else (a local bare-repo path used in
 * verification, an unrecognized host) rather than guessing.
 */
export function remoteOwner(
  repoRoot: string,
  remote: string,
): string | undefined {
  let url: string;
  try {
    url = git(repoRoot, ['remote', 'get-url', remote]);
  } catch {
    return undefined;
  }
  const match = /github\.com[:/]([^/]+)\//.exec(url);
  return match?.[1];
}
