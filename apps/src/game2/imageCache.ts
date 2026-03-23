/**
 * Shared in-memory image cache for Game2.
 *
 * Once an image is loaded (e.g. in the Items panel), the same HTMLImageElement
 * is reused everywhere (World panel, Play runtime) so it never re-fetches.
 */

const cache = new Map<string, HTMLImageElement>();

/**
 * Get or create an HTMLImageElement for the given asset URL.
 * If the element already exists in the cache it is returned immediately
 * (it may still be loading — callers should check `.complete`).
 */
export function getCachedImage(url: string): HTMLImageElement {
  const existing = cache.get(url);
  if (existing) {
    return existing;
  }
  const el = new Image();
  el.crossOrigin = 'anonymous';
  el.src = url;
  cache.set(url, el);
  return el;
}

/**
 * Build an asset URL for a given channel + filename.
 */
export function assetUrl(channelId: string, filename: string): string {
  return `/v3/assets/${channelId}/${encodeURIComponent(filename)}`;
}
