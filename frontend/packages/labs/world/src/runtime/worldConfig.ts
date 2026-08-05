// Host-supplied configuration for the sandbox, mirroring web-lab's
// `previewConfig.ts` (the origin) and python-lab's `pyodideConfig.ts` (the asset
// base). Nothing here is hard-coded: the studio host or the standalone demo sets
// the sandbox origin, and the demo's two-port `dev:isolated` and production's
// per-project subdomain use the same code path.

/** Query param on the lab URL naming the sandbox origin's base URL. */
export const SANDBOX_URL_PARAM = 'world-sandbox';

/**
 * Where the two sandbox surfaces sit under the sandbox base — a directory of
 * their own, not the root of the origin.
 *
 * On a dedicated sandbox origin this is cosmetic. It is load-bearing when the
 * lab and the sandbox share one origin, which a static host that hands out an
 * origin per ACCOUNT rather than per site forces (GitHub Pages, see the
 * README's deploy section). Two service workers cannot both hold one scope: the
 * later registration replaces the earlier, so the lab's mock API and the
 * sandbox's build transport evicted each other and the game never got its
 * module. Registering the build worker beside these pages scopes it to this
 * directory, and a client is controlled by the most specific scope that matches
 * it — so the lab keeps its own worker at the base above.
 */
export const SANDBOX_SURFACE_DIR = 'sandbox/';

let sandboxUrl: string | null = null;
let assetBaseUrl = '/vendor/';
let backgroundBaseUrl = '/backgrounds/';

/** Point the lab at a sandbox origin base (e.g. `http://localhost:5202/`). */
export function setSandboxUrl(url: string | null): void {
  sandboxUrl = url;
}

/** Read the sandbox base URL from a `location.search` string; null if unset. */
export function parseSandboxUrl(search: string): string | null {
  const value = new URLSearchParams(search).get(SANDBOX_URL_PARAM);
  return value ? value : null;
}

/**
 * The sandbox origin base URL, or null when none is configured — in which case
 * the lab shows a message instead of running student code on its own origin.
 */
export function getSandboxUrl(): string | null {
  if (sandboxUrl) {
    return sandboxUrl;
  }
  if (typeof window === 'undefined') {
    return null;
  }
  return parseSandboxUrl(window.location.search);
}

/**
 * Origin-relative base the sandbox serves its self-hosted assets from
 * (esbuild-wasm, Phaser). Forwarded to the sandbox iframes so it resolves
 * against the sandbox origin, not the lab's.
 */
export function getAssetBaseUrl(): string {
  return assetBaseUrl;
}

export function setAssetBaseUrl(url: string): void {
  assetBaseUrl = url.endsWith('/') ? url : `${url}/`;
}

/**
 * Base the stock backdrops are served from.
 *
 * The LAB's origin, not the sandbox's — unlike `assetBaseUrl`. A backdrop is
 * fetched when a learner imports one, which happens in the library dialog and
 * ends with the bytes inlined into the project; the sandbox only ever sees the
 * copy the project holds. So this is not forwarded to the iframes.
 *
 * The demo serves what `yarn setup:world` fetched into `public/backgrounds/`
 * (BACKGROUNDS.md §7); the studio host serves its own copies and says where.
 */
export function getBackgroundBaseUrl(): string {
  return backgroundBaseUrl;
}

export function setBackgroundBaseUrl(url: string): void {
  backgroundBaseUrl = url.endsWith('/') ? url : `${url}/`;
}
