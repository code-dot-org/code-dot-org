// CSRF token for mutating requests. The Rails shell injects
// <meta name="csrf-token">; a hard load of an SPA subroute may be served a
// static shell without it, so the host primes a token from GET /get_token.

// Type-only import avoids a cycle: the transports depend on this module.
import type {Transport} from './transports/types';

let spaCsrfToken: string | null = null;

export function setSpaCsrfToken(token: string | null): void {
  spaCsrfToken = token;
}

export function getSpaCsrfToken(): string | null {
  return spaCsrfToken;
}

function metaCsrfToken(): string | null {
  return (
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.content ?? null
  );
}

export function resolveCsrfToken(): string | null {
  // A fetched token is at least as fresh as the page-load meta, and strictly
  // fresher after a server-side rotation (e.g. signing out other sessions).
  return spaCsrfToken ?? metaCsrfToken();
}

// Re-fetch and store the session token (the `csrf-token` header of
// GET /get_token) after a server action rotates it. Swallows failure: a stale
// token, if it matters, surfaces on the next mutation.
export async function refreshCsrfToken(transport: Transport): Promise<void> {
  try {
    const {meta} = await transport.requestWithMeta({
      method: 'GET',
      url: '/get_token',
    });
    const token = meta.headers['csrf-token'];
    if (token) setSpaCsrfToken(token);
  } catch {
    // leave the current token in place
  }
}
