import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * Plumbing-only git operations for building a commit without ever touching
 * a caller's checked-out working tree, index, or HEAD (widget PR flow: the
 * propose flow must not disturb the monorepo checkout it runs from, or any
 * checkout at all when its target is a scratch clone of a different repo).
 * Every write here goes through a scratch index file (`GIT_INDEX_FILE`, a
 * temp file this module owns) and plumbing commands (`hash-object`,
 * `read-tree`, `update-index`, `write-tree`, `commit-tree`) — none of which
 * read or write `.git/index` or `.git/HEAD`.
 *
 * Moved here (from authoring-service's publish/gitPlumbing.ts) unchanged so
 * this package and the authoring-service HTTP wrapper share one
 * implementation and can never disagree about how a commit gets built.
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

/** Deletes `branch` on `remote` — the cleanup half of a real-repo test push. */
export function deleteRemoteBranch(
  repoRoot: string,
  remote: string,
  branch: string,
): void {
  git(repoRoot, ['push', remote, `:refs/heads/${branch}`]);
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
  return remoteOwnerRepo(repoRoot, remote)?.owner;
}

/** Same as `remoteOwner`, plus the repo name — the staff-apps target needs
 * both to build a compare URL or a PR request, since it does not push into
 * a fixed, hardcoded repo the way the catalog target does. */
export function remoteOwnerRepo(
  repoRoot: string,
  remote: string,
): {owner: string; repo: string} | undefined {
  let url: string;
  try {
    url = git(repoRoot, ['remote', 'get-url', remote]);
  } catch {
    return undefined;
  }
  return parseGithubOwnerRepo(url);
}

/** Same parse `remoteOwnerRepo` does, over a URL string directly rather than
 * a configured remote name — for a staff-apps scratch clone the URL comes
 * straight from an env var, with no local remote registered yet at parse
 * time. */
export function parseGithubOwnerRepo(
  url: string,
): {owner: string; repo: string} | undefined {
  const match = /github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?\/?$/.exec(
    url.trim(),
  );
  return match ? {owner: match[1], repo: match[2]} : undefined;
}

/**
 * A throwaway bare repo — no working tree, so there is nothing for the
 * scratch-clone dance below to accidentally disturb. The staff-apps target
 * builds its commit here rather than in this monorepo's own `.git`, so a
 * propose against an unrelated repo never touches this checkout's refs.
 */
export function initBareScratchRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'widget-propose-scratch-'));
  execFileSync('git', ['init', '--bare', '--quiet'], {cwd: dir});
  return dir;
}

export function removeScratchRepo(dir: string): void {
  fs.rmSync(dir, {recursive: true, force: true});
}

export function addRemote(repoRoot: string, name: string, url: string): void {
  git(repoRoot, ['remote', 'add', name, url]);
}

/**
 * `HEAD`'s target branch name on `remoteUrl`, without cloning anything —
 * one network round trip (`git ls-remote --symref`), no working tree, no
 * object transfer. The staff-apps target does not assume `main`: it asks
 * the remote what its default branch actually is.
 */
export function discoverDefaultBranch(remoteUrl: string): string {
  const output = execFileSync(
    'git',
    ['ls-remote', '--symref', remoteUrl, 'HEAD'],
    {encoding: 'utf8'},
  );
  const match = /^ref:\s+refs\/heads\/(\S+)\s+HEAD/m.exec(output);
  if (!match) {
    throw new Error(
      `could not discover the default branch of ${remoteUrl} from ls-remote output`,
    );
  }
  return match[1];
}

/**
 * Fetches exactly one branch, one commit deep, into a local ref of the same
 * name — the parentage a staff-apps proposal needs (its new commit must
 * have the real repo's tip as a parent) without ever fetching the whole
 * history.
 */
export function fetchShallowBranch(
  repoRoot: string,
  remote: string,
  branch: string,
): void {
  git(repoRoot, [
    'fetch',
    '--depth',
    '1',
    remote,
    `${branch}:refs/heads/${branch}`,
  ]);
}

/** `git show <ref>:<path>`, or undefined if the path does not exist at that
 * ref — used to read a target repo's existing `widgets/manifest.json` (or
 * absence of one) before merging in a new entry. Byte-exact: unlike every
 * other function in this module, this one does NOT trim the result — a
 * file's own trailing newline is part of its content, not incidental
 * whitespace around a git command's output. */
export function readFileAtRef(
  repoRoot: string,
  ref: string,
  filePath: string,
): string | undefined {
  try {
    return execFileSync('git', ['show', `${ref}:${filePath}`], {
      cwd: repoRoot,
      encoding: 'utf8',
    });
  } catch {
    return undefined;
  }
}

/** Immediate subdirectory names of `dirPath` at `ref` — used to list the
 * staff-apps target's existing `widgets/<slug>` entries for slug-collision
 * checking. Returns `[]` if `dirPath` does not exist at `ref` (e.g. the
 * very first widget proposed against a repo with no `widgets/` yet). */
export function listDirNames(
  repoRoot: string,
  ref: string,
  dirPath: string,
): string[] {
  let output: string;
  try {
    output = git(repoRoot, ['ls-tree', `${ref}:${dirPath}`]);
  } catch {
    return [];
  }
  return output
    .split('\n')
    .filter(line => line.startsWith('040000 tree'))
    .map(line => line.split('\t')[1])
    .filter((name): name is string => Boolean(name));
}
