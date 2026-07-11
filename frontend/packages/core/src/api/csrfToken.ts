// CSRF token for mutating requests. The Rails shell injects
// <meta name="csrf-token">; a hard load of an SPA subroute may be served a
// static shell without it, so the host primes a token from GET /get_token.

import {logger} from '../plugins/observability';
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
  } catch (error) {
    // Debug breadcrumb, not an error event: the failure self-heals (see above),
    // but a later stale-token 422 should be traceable to it.
    logger.debug('csrf token refresh failed', {error});
  }
}

/** Ensures the next mutating request can receive an authenticity token. */
export async function ensureCsrfToken(transport: Transport): Promise<void> {
  if (resolveCsrfToken()) {
    return;
  }

  await refreshCsrfToken(transport);
  if (!resolveCsrfToken()) {
    throw new Error('Unable to resolve a CSRF token');
  }
}
