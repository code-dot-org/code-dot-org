/**
 * joinCode — resolves a short alphanumeric join code to a notebook URL.
 *
 * Join codes are distributed by teachers to give students one-tap access to a
 * specific notebook assignment.  Format: 4–6 uppercase alphanumeric characters
 * (e.g. `NB7K`, `MA72X3`).  Case-insensitive on input; uppercased before
 * resolution.
 *
 * Resolution order (per contracts/url-contracts.md §"Join codes"):
 *   1. Primary:  `@code-dot-org/core` API client `resolveJoinCode`, if the
 *      symbol is exported by that package in the running environment.
 *   2. Fallback: `GET https://code.org/go/<code>` following redirects; the
 *      final response URL is taken as the resolved notebook URL.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Validates the raw user input before uppercasing. */
const JOIN_CODE_PATTERN = /^[A-Z0-9]{4,6}$/i;

/** Base URL used by the fallback HTTP resolver. */
const GO_BASE_URL = 'https://code.org/go/';

// ---------------------------------------------------------------------------
// Error type
// ---------------------------------------------------------------------------

/**
 * Thrown when join code resolution fails.  The `reason` discriminant lets
 * callers display an appropriate localized message without parsing the error
 * text.
 */
export class JoinCodeError extends Error {
  /** Machine-readable failure category. */
  readonly reason: 'invalid-format' | 'not-found' | 'network';

  /**
   * @param reason - Machine-readable failure category.
   * @param message - Human-readable detail (English, for logging).
   */
  constructor(
    reason: 'invalid-format' | 'not-found' | 'network',
    message: string
  ) {
    super(message);
    this.name = 'JoinCodeError';
    this.reason = reason;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when `code` (already uppercased) matches the required format.
 *
 * @param code - Uppercased candidate code.
 * @returns Whether the code satisfies the 4–6 alphanumeric constraint.
 */
function isValidFormat(code: string): boolean {
  return JOIN_CODE_PATTERN.test(code);
}

/**
 * Attempts to resolve a code via `@code-dot-org/core`'s `resolveJoinCode`
 * export, if that symbol exists at runtime.  Returns `null` when the export
 * is absent so the caller falls through to the HTTP fallback.
 *
 * Dynamic import is used to avoid a hard-failure when the symbol is not yet
 * exported by the core package.
 *
 * @param code - Uppercased, validated join code.
 * @returns Resolved URL string, or `null` if the primary resolver is absent.
 */
async function tryPrimaryResolver(code: string): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const core = await import('@code-dot-org/core') as Record<string, any>;
    if (typeof core.resolveJoinCode === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const result = await core.resolveJoinCode(code) as {url: string};
      return result.url;
    }
  } catch {
    // Primary resolver unavailable or failed; fall through to HTTP fallback.
  }
  return null;
}

/**
 * Resolves a join code via the `https://code.org/go/<code>` redirect endpoint.
 * Takes `response.url` (the final URL after following redirects) as the result.
 *
 * @param code - Uppercased, validated join code.
 * @returns Resolved URL string.
 * @throws {JoinCodeError} On non-2xx response or network error.
 */
async function resolveViaHttp(code: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${GO_BASE_URL}${code}`, {redirect: 'follow'});
  } catch (err) {
    throw new JoinCodeError(
      'network',
      `Network error resolving join code "${code}": ${String(err)}`
    );
  }

  if (!response.ok) {
    throw new JoinCodeError(
      'not-found',
      `Join code "${code}" not found (HTTP ${response.status})`
    );
  }

  return response.url;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Resolves a join code to a notebook URL.
 *
 * Input is uppercased and validated against `^[A-Z0-9]{4,6}$` before any
 * network call is made.  Resolution tries the `@code-dot-org/core` API client
 * first; if that symbol is absent the function falls back to the HTTP
 * redirect at `https://code.org/go/<code>`.
 *
 * The returned URL should be passed through `rewriteGithubUrl` before fetching
 * notebook bytes.
 *
 * @param code - Raw join code from the user (case-insensitive, 4–6 chars).
 * @returns Resolved URL pointing to the notebook resource.
 * @throws {JoinCodeError} With `reason: 'invalid-format'` if the code does not
 *   match the required format.
 * @throws {JoinCodeError} With `reason: 'not-found'` if the server returns a
 *   non-2xx response.
 * @throws {JoinCodeError} With `reason: 'network'` on a fetch/network failure.
 */
export async function resolveJoinCode(code: string): Promise<string> {
  const upper = code.toUpperCase();

  if (!isValidFormat(upper)) {
    throw new JoinCodeError(
      'invalid-format',
      `Join code "${code}" must be 4–6 alphanumeric characters`
    );
  }

  const primary = await tryPrimaryResolver(upper);
  if (primary !== null) {
    return primary;
  }

  return resolveViaHttp(upper);
}
