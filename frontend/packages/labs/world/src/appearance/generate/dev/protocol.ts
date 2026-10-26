// What the browser and the dev proxy say to each other.
//
// A shape of this LAB's own, not the provider's. The browser half
// (`generate/directImages`) knows nothing about who draws, and the node half
// (`dev/openai`) knows nothing about the wizard — which is what makes pointing
// the proxy at a different service a morning's work rather than a rewrite. The
// tutor's protocol says the same thing, having been written before it was
// pointed somewhere else (`@code-dot-org/aitutor`, `dev/protocol`).
//
// It exists at all because the alternative is a key in the browser. A provider
// will talk to a page directly if asked, and a key reachable from a page is a
// key in the bundle, in the dev tools, and in whatever that page is later
// deployed as.

/** The route the plugin serves, on the Vite dev server's own origin. */
export const DRAW_ROUTE = '/__images/draw';

/**
 * Whether a proxy is there at all.
 *
 * Separate from the drawing route so the wizard can find out BEFORE it offers
 * the door. A door that offers to draw and then fails on the first press reads
 * as a broken lab; one that asked first can simply not offer.
 *
 * ANSWERED EVEN WHEN THERE IS NO KEY, which is what tells the lab it is in the
 * harness at all: a route that 404s means no dev server, and a route that says
 * `available: false` means a dev server with nothing behind it. Those are
 * different situations and the wizard treats them differently
 * (`generate/chooseImageGenerator`).
 */
export const STATUS_ROUTE = '/__images/status';

export interface ImageProxyStatus {
  /** True when a key was found and the route will answer. */
  available: boolean;
  /** The model it will use, for the page to show. */
  model?: string;
  /** Why not, when not — for a human, not for a branch. */
  reason?: string;
}

export interface DrawProxyRequest {
  /**
   * The whole prompt, shaped for what the picture is for.
   *
   * SHAPED BY THE BROWSER HALF, which is where the lab's vocabulary lives: the
   * node half is told what to ask for and how, and knows nothing about actors
   * or backdrops (`generate/imagePrompts`).
   */
  prompt: string;
  /** How many to draw. The proxy caps it. */
  count?: number;
  /** Overrides the proxy's own default. */
  model?: string;
  /** `1024x1024` and the like; the provider decides what it accepts. */
  size?: string;
  /**
   * Whether the picture needs to see what is behind it.
   *
   * An actor does and a backdrop does not. Asked of the provider rather than
   * cut out afterwards, which is what Sprite Lab has to do with models that
   * will not draw transparency — and which risks eating a colour that also
   * appears on the subject.
   */
  transparent?: boolean;
}

export interface DrawProxyReply {
  /** What came back: base64 PNGs, in the order the provider gave them. */
  pictures: Array<{base64: string; mediaType: string}>;
  /**
   * What went wrong, in words the wizard can show.
   *
   * A reply rather than a status code, for the reason the tutor's proxy gives:
   * the page renders a failed attempt and has nothing to do with HTTP.
   */
  failure?: string;
  /**
   * What the provider actually said, verbatim.
   *
   * For the developer who owns the key and never for a learner. It exists
   * because the alternative is mapping a 401 to "something went wrong" and
   * dropping the body that said the key was invalid — leaving the one person
   * who could fix it with less than curl would have told them.
   */
  detail?: string;
}
