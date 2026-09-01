import {execFileSync} from 'node:child_process';

/** What it takes to open a pull request: an already-pushed branch, nothing
 * else. This module never pushes anything itself. */
export interface CreatePullRequestInput {
  owner: string;
  repo: string;
  base: string;
  head: string;
  title: string;
  body: string;
}

export type CreatePullRequestResult =
  | {ok: true; method: 'gh' | 'api'; url: string}
  | {ok: false; method: 'gh' | 'api'; error: string}
  | {ok: false; method: 'none'; reason: string};

export interface CreatePullRequestDeps {
  /** Defaults to checking `gh --version` on PATH. */
  ghAvailable?: () => boolean;
  /** Defaults to `execFileSync('gh', args, {encoding: 'utf8'})`. Injectable
   * so a test can prove the exact `gh pr create` invocation without a real
   * `gh` binary or network access. */
  runGh?: (args: string[]) => string;
  /** Defaults to the global `fetch`. Injectable so a test can assert the
   * REST request shape without a real network call. */
  fetchImpl?: typeof fetch;
  /** A token for the REST fallback — `AUTHORING_GITHUB_TOKEN`, `GH_TOKEN`,
   * or `GITHUB_TOKEN`, in that order. `undefined` means neither `gh` nor a
   * token is usable, so this module can only report the omission. */
  token?: string;
}

function defaultGhAvailable(): boolean {
  try {
    execFileSync('gh', ['--version'], {stdio: 'ignore'});
    return true;
  } catch {
    return false;
  }
}

function defaultRunGh(args: string[]): string {
  return execFileSync('gh', args, {encoding: 'utf8'}).trim();
}

/**
 * Attempts to open a pull request in this order — `gh pr create` if `gh` is
 * on PATH, else a GitHub REST call if a token is configured, else neither —
 * and never fabricates a URL. This is the ONLY place in the propose flow
 * that opens a real pull request; the catalog target never calls this at
 * all (widget PR flow plan: a human opens that one from the compare URL).
 */
export async function createPullRequest(
  input: CreatePullRequestInput,
  deps: CreatePullRequestDeps = {},
): Promise<CreatePullRequestResult> {
  const ghAvailable = deps.ghAvailable ?? defaultGhAvailable;
  const runGh = deps.runGh ?? defaultRunGh;

  if (ghAvailable()) {
    try {
      const output = runGh([
        'pr',
        'create',
        '--repo',
        `${input.owner}/${input.repo}`,
        '--base',
        input.base,
        '--head',
        input.head,
        '--title',
        input.title,
        '--body',
        input.body,
      ]);
      // `gh pr create` prints progress lines and ends with the PR URL.
      const url = output.trim().split('\n').pop() ?? '';
      if (!/^https?:\/\//.test(url)) {
        return {ok: false, method: 'gh', error: `unexpected gh output: ${output}`};
      }
      return {ok: true, method: 'gh', url};
    } catch (error) {
      return {ok: false, method: 'gh', error: describeError(error)};
    }
  }

  if (deps.token) {
    const fetchImpl = deps.fetchImpl ?? fetch;
    try {
      const res = await fetchImpl(
        `https://api.github.com/repos/${input.owner}/${input.repo}/pulls`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${deps.token}`,
            Accept: 'application/vnd.github+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title,
            head: input.head,
            base: input.base,
            body: input.body,
          }),
        },
      );
      const data: unknown = await res.json().catch(() => undefined);
      if (!res.ok) {
        return {
          ok: false,
          method: 'api',
          error: `GitHub API POST /pulls: ${res.status} ${JSON.stringify(data)}`,
        };
      }
      const url = (data as {html_url?: string} | undefined)?.html_url;
      if (!url) {
        return {
          ok: false,
          method: 'api',
          error: `GitHub API response had no html_url: ${JSON.stringify(data)}`,
        };
      }
      return {ok: true, method: 'api', url};
    } catch (error) {
      return {ok: false, method: 'api', error: describeError(error)};
    }
  }

  return {
    ok: false,
    method: 'none',
    reason:
      'no gh on PATH and no AUTHORING_GITHUB_TOKEN/GH_TOKEN/GITHUB_TOKEN set',
  };
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
