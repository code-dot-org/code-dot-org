const CACHE_SIZE = 25;

interface CanvasEntry {
  key: string | null;
  canvas: HTMLCanvasElement;
}

/**
 * LRU cache of HTMLCanvasElements, keyed by an arbitrary string.
 *
 * Avoids repeated `document.createElement('canvas')` calls for frequently
 * re-drawn fish frames. The most-recently-used canvas lives at index 0;
 * the least-recently-used is evicted when a miss occurs.
 */
export default class CanvasCache {
  private readonly canvases: CanvasEntry[];

  constructor() {
    this.canvases = [];
    for (let i = 0; i < CACHE_SIZE; ++i) {
      this.canvases.push({
        key: null,
        canvas: document.createElement('canvas'),
      });
    }
  }

  /** Invalidates all entries without releasing the underlying canvas elements. */
  clearCache(): void {
    this.canvases.forEach(entry => (entry.key = null));
  }

  /**
   * Returns a canvas reserved for the caller and a boolean indicating whether
   * the canvas already contains the content for `key` (cache hit).
   *
   * The caller must not assume anything about the canvas state on a miss.
   *
   * @param key - Opaque cache key identifying the desired canvas content.
   * @returns `[canvas, hit]` — the reserved canvas and whether it was a hit.
   */
  getCanvas(key: string): [HTMLCanvasElement, boolean] {
    let entryIdx = this.canvases.findIndex(elem => elem.key === key);
    // On a miss, evict the least-recently-used (last) entry.
    if (entryIdx === -1) {
      entryIdx = this.canvases.length - 1;
    }
    const entry = this.canvases.splice(entryIdx, 1)[0];
    const cacheHit = entry.key === key;
    entry.key = key;
    // Promote to front (most-recently-used).
    this.canvases.unshift(entry);
    return [entry.canvas, cacheHit];
  }
}
