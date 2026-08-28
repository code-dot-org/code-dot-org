import {execFileSync} from 'node:child_process';
import path from 'node:path';

/**
 * Cheap version-bump enforcement (widget PR flow plan, risk #8's default:
 * any source change needs SOME bump, major-vs-patch left to the author).
 * A widget whose `src/` changed relative to a git base ref must also have
 * changed `widget.json`'s `version`, with a matching CHANGELOG.md entry
 * (checked separately by testGates.ts). Skips — rather than fails — when
 * git history isn't usable for the comparison, since that's an environment
 * limitation, not a policy violation.
 */
export interface VersionBumpCheckResult {
  skipped: boolean;
  skipReason?: string;
  failures: string[];
}

function tryGit(args: string[], cwd: string): string | null {
  try {
    return execFileSync('git', args, {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

function resolveBaseRef(cwd: string, explicitRef?: string): string | null {
  if (explicitRef) {
    return tryGit(['rev-parse', '--verify', explicitRef], cwd) !== null
      ? explicitRef
      : null;
  }
  // Diff straight against origin/staging's tip rather than a merge-base:
  // a merge-base needs shared ancestry, which a CI runner's shallow
  // checkout (fetch-depth 1, per actions/checkout's default) does not
  // have. Diffing against a ref's tree only needs that one commit fetched.
  if (tryGit(['rev-parse', '--verify', 'origin/staging'], cwd) !== null) {
    return 'origin/staging';
  }
  return tryGit(['rev-parse', '--verify', 'HEAD~1'], cwd) !== null
    ? 'HEAD~1'
    : null;
}

export function checkVersionBumps(
  packageRoot: string,
  slugs: string[],
  currentVersions: Record<string, string>,
  options: {baseRef?: string} = {},
): VersionBumpCheckResult {
  const repoRoot = tryGit(['rev-parse', '--show-toplevel'], packageRoot);
  if (!repoRoot) {
    return {
      skipped: true,
      skipReason: 'not inside a git checkout',
      failures: [],
    };
  }
  const baseRef = resolveBaseRef(packageRoot, options.baseRef);
  if (!baseRef) {
    return {
      skipped: true,
      skipReason: 'no usable git base ref (checked origin/staging, HEAD~1)',
      failures: [],
    };
  }

  const relPackageRoot = path.relative(repoRoot, packageRoot);
  const failures: string[] = [];
  for (const slug of slugs) {
    const relSrcDir = path.join(relPackageRoot, 'widgets', slug, 'src');
    const relManifest = path.join(
      relPackageRoot,
      'widgets',
      slug,
      'widget.json',
    );
    const changed = tryGit(
      ['diff', '--name-only', baseRef, '--', relSrcDir],
      repoRoot,
    );
    if (!changed) {
      // No diff (or the diff itself couldn't run) — nothing to enforce.
      continue;
    }
    const oldManifestRaw = tryGit(
      ['show', `${baseRef}:${relManifest}`],
      repoRoot,
    );
    if (oldManifestRaw === null) {
      // Widget didn't exist at the base ref — it's new, no bump is owed.
      continue;
    }
    let oldVersion: unknown;
    try {
      oldVersion = JSON.parse(oldManifestRaw).version;
    } catch {
      continue;
    }
    if (oldVersion === currentVersions[slug]) {
      failures.push(
        `${slug}: source changed under widgets/${slug}/src relative to ` +
          `${baseRef}, but widget.json version is still ${String(oldVersion)}. ` +
          `Bump the version and add a CHANGELOG.md entry.`,
      );
    }
  }
  return {skipped: false, failures};
}
