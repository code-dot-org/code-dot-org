// What the browser and the dev proxy say to each other.
//
// A shape of this package's own, not the provider's. The browser half
// (`transport/direct`) knows nothing about Anthropic, and the node half
// (`dev/anthropic`) knows nothing about the panel — which is what makes it a
// day's work rather than a rewrite to point the proxy somewhere else.
//
// It exists at all because the alternative is a key in the browser. The
// provider will talk to a page directly if asked (Anthropic wants a header
// spelled `anthropic-dangerous-direct-browser-access`, and the spelling is the
// documentation), but a key reachable from a page is a key in the bundle, in
// the dev tools, and in whatever the page is later deployed as.

/** The route the plugin serves, on the Vite dev server's own origin. */
export const COMPLETE_ROUTE = '/__tutor/complete';

/**
 * Whether a proxy is there at all.
 *
 * Separate from the completion route so a page can find out BEFORE the student
 * asks something. Absent, the demo says so and falls back to a recording — a
 * live transport that fails on first use looks like a broken tutor rather than
 * a missing key.
 */
export const STATUS_ROUTE = '/__tutor/status';

export interface ProxyStatus {
  /** True when a key was found and the route will answer. */
  available: boolean;
  /** The model it will use, for the page to show. */
  model?: string;
  /** Why not, when not — for a human, not for a branch. */
  reason?: string;
}

export interface ProxyRequest {
  /** The conversation so far, oldest first, then the new question. */
  messages: Array<{role: 'user' | 'assistant'; text: string}>;
  /** The system prompt, including the project context. */
  system?: string;
  /** Overrides the proxy's own default. */
  model?: string;
  /** When set, the answer is required to fit it. */
  responseSchema?: object;
}

export interface ProxyReply {
  text: string;
  /** Present when the request carried a `responseSchema`. */
  structured?: unknown;
  /**
   * Why the turn failed, when it did.
   *
   * One of this package's `AiInteractionStatus` values, chosen by the proxy —
   * it is the half that sees the provider's status codes, and the browser half
   * should not be re-deriving "was that a rate limit" from a message string.
   */
  failure?: string;
}
