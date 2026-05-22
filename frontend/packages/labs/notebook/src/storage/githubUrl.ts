/**
 * githubUrl — rewrites GitHub blob/raw page URLs to raw.githubusercontent.com
 * so the importer can fetch notebook bytes directly.
 *
 * Verbatim port of the jupyter-k12 URL rewrite logic, as documented in
 * contracts/url-contracts.md §"GitHub URL rewrite".
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Hostname of the GitHub UI that hosts blob/raw views. */
const GITHUB_HOST = 'github.com';

/** Hostname used by raw content delivery for GitHub repositories. */
const RAW_HOST = 'raw.githubusercontent.com';

/** URL segment used in GitHub blob page paths. */
const BLOB_SEGMENT = '/blob/';

/** URL segment used in GitHub raw page paths. */
const RAW_SEGMENT = '/raw/';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when `url` is a parseable absolute URL whose hostname is
 * `github.com` and whose path contains the given segment.
 *
 * @param url - URL string to test.
 * @param segment - Path segment to look for (e.g. `'/blob/'`).
 * @returns Whether the URL matches the GitHub host and contains the segment.
 */
function isGithubPathWithSegment(url: string, segment: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname === GITHUB_HOST && parsed.pathname.includes(segment);
  } catch {
    return false;
  }
}

/**
 * Replaces `github.com` with `raw.githubusercontent.com` and removes the
 * intermediate `/blob/` or `/raw/` segment so the path becomes
 * `/<owner>/<repo>/<ref>/<path>`.
 *
 * @param url - A GitHub blob or raw URL (already validated by the caller).
 * @param segment - The path segment to remove (`'/blob/'` or `'/raw/'`).
 * @returns The rewritten `raw.githubusercontent.com` URL string.
 */
function rewriteToRaw(url: string, segment: string): string {
  const parsed = new URL(url);
  parsed.hostname = RAW_HOST;
  parsed.pathname = parsed.pathname.replace(segment, '/');
  return parsed.toString();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Rewrites a GitHub blob or raw URL to the equivalent raw.githubusercontent.com
 * URL for direct byte access.
 *
 * Handles two input patterns:
 * - `https://github.com/<owner>/<repo>/blob/<ref>/<path>`
 * - `https://github.com/<owner>/<repo>/raw/<ref>/<path>`
 *
 * Both are rewritten to:
 * - `https://raw.githubusercontent.com/<owner>/<repo>/<ref>/<path>`
 *
 * Any URL that does not match either pattern — including already-raw URLs,
 * non-GitHub URLs, malformed strings, and empty strings — is returned
 * unmodified. This function never throws.
 *
 * @param url - Input URL string.
 * @returns Rewritten URL if the input matches a GitHub blob/raw pattern;
 *   otherwise the original `url` unchanged.
 */
export function rewriteGithubUrl(url: string): string {
  if (isGithubPathWithSegment(url, BLOB_SEGMENT)) {
    return rewriteToRaw(url, BLOB_SEGMENT);
  }
  if (isGithubPathWithSegment(url, RAW_SEGMENT)) {
    return rewriteToRaw(url, RAW_SEGMENT);
  }
  return url;
}
