// Host-supplied configuration for the sandbox, mirroring web-lab's
// `previewConfig.ts` (the origin) and python-lab's `pyodideConfig.ts` (the asset
// base). Nothing here is hard-coded: the studio host or the standalone demo sets
// the sandbox origin, and the demo's two-port `dev:isolated` and production's
// per-project subdomain use the same code path.

/** Query param on the lab URL naming the sandbox origin's base URL. */
export const SANDBOX_URL_PARAM = 'world-sandbox';

let sandboxUrl: string | null = null;
let assetBaseUrl = '/vendor/';

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
