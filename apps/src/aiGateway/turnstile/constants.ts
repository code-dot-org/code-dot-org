export const TURNSTILE_SCRIPT_URL =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
export const CONTAINER_ID = 'turnstile-container';
export const TURNSTILE_SITE_KEY = '0x4AAAAAACva3yXFGIuj6pR8';
export const CHALLENGE_TIMEOUT_MS = 30_000;
// Turnstile tokens expire after ~5 minutes. Discard a pre-fetched token
// after 4 minutes so a stale one is never sent to the server.
export const TOKEN_MAX_AGE_MS = 4 * 60 * 1000;
// How long to wait for the probe Worker to respond before concluding it was
// paused by the DevTools debugger. Starting a Worker on a busy low-end
// Chromebook can take a hefty amount of time. Therefore, this time is meant
// to accommodate that case so we don't hit a false negative where it assumes
// the devtools turnstile breakpoint has hit when it is just that the worker
// is taking a long time to start. This is OK because in practice, this timeout
// only happens when the devtools window actually is indeed open. In every good
// case, the timeout is superceded by the worker response, which happens as
// quickly as possible, and often well within 100ms.
export const DEBUGGER_PROBE_TIMEOUT_MS = 1000;

export const LOG = '🟠 [Cloudflare Turnstile]';
