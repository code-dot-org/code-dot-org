export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
export const CONTAINER_ID = 'turnstile-container';
export const TURNSTILE_SITE_KEY = '0x4AAAAAACva3yXFGIuj6pR8';
export const CHALLENGE_TIMEOUT_MS = 30_000;
// Turnstile tokens expire after ~5 minutes. Discard a pre-fetched token
// after 4 minutes so a stale one is never sent to the server.
export const TOKEN_MAX_AGE_MS = 4 * 60 * 1000;
// How long to wait for the probe Worker to respond before concluding it was
// paused by the DevTools debugger. The Worker posts a message in microseconds
// when not paused, so 100 ms is an unambiguous signal — and short enough
// that the user never perceives it on the happy path.
export const DEBUGGER_PROBE_TIMEOUT_MS = 100;

export const LOG = '🟠 [Cloudflare Turnstile]';
