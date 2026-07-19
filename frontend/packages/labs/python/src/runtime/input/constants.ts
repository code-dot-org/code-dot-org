// Constants for blocking `input()` support. Duplicated in
// public/inputServiceWorker.js because a service worker cannot import modules —
// keep the two in sync. Ported from apps/src/pythonlab/pythonHelpers/constants.ts.

/** Service worker → window: a program is blocked awaiting stdin. */
export const AWAITING_INPUT = 'AWAITING_INPUT';

/** Window → service worker: here is the value the program asked for. */
export const SENDING_INPUT = 'SENDING_INPUT';

/**
 * The virtual path the worker's blocking XHR hits; the input service worker
 * intercepts it (nothing actually serves it). Its parent scope, `/`, must cover
 * both this path and the pyodide worker's script URL, so the worker is a client
 * the service worker controls.
 */
export const SERVICE_WORKER_PATH = '/pythonlab-input-sw/';

/** URL the input service worker is served from (see public/). */
export const INPUT_SERVICE_WORKER_URL = '/inputServiceWorker.js';

/**
 * Inline tags Python prints to stdout that the manager interprets rather than
 * showing verbatim. `as const` object, not a TS enum (this package's
 * `erasableSyntaxOnly` forbids enums). Ported from patches.ts's MessageTag.
 */
export const MessageTag = {
  /** Prefix of an input prompt line, written to the console without a newline. */
  INPUT_PROMPT: '[INPUT_PROMPT]',
  /** The blocking input request failed (no controlling service worker). */
  INPUT_FAILED: '[INPUT_FAILED]',
  /**
   * Prefix of a stdout line carrying a base64-encoded matplotlib figure (emitted
   * by pythonlab_setup's patched `plt.show()`): `MATPLOTLIB_SHOW_IMG <base64>`.
   */
  MATPLOTLIB_IMG: 'MATPLOTLIB_SHOW_IMG',
} as const;
