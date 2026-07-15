import {getSpaCsrfToken, setSpaCsrfToken} from '@code-dot-org/core/api';

/**
 * Ensures mutations can send an X-CSRF-Token. The Rails-rendered shell injects
 * the csrf-token meta, but a hard load of an SPA subroute can be served a
 * static shell without it; in that case fetch a token from GET /get_token,
 * which returns it in the `csrf-token` response header (empty body). No-op when
 * the meta is present or a token is already primed.
 */
export async function primeCsrfToken(): Promise<void> {
  if (document.querySelector('meta[name="csrf-token"]')) return;
  if (getSpaCsrfToken()) return;
  try {
    const response = await fetch('/get_token', {credentials: 'same-origin'});
    const token = response.headers.get('csrf-token');
    if (token) setSpaCsrfToken(token);
  } catch {
    // Leave it unset; a later mutation surfaces the error if one was needed.
  }
}
