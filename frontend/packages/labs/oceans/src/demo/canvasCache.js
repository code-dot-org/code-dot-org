const CACHE_SIZE = 25;

export default class CanvasCache {
  /*
   * Instantiates this.canvases that holds CACHE_SIZE canvases. this.canvases
   * is ordered by most recent use, with the canvas at spot 0 being *most*
   * recently used.
   */
  constructor() {
    this.canvases = [];
    for (var i = 0; i < CACHE_SIZE; ++i) {
      this.canvases.push({
        key: null,
        canvas: document.createElement('canvas')
      });
    }
  }

  clearCache() {
    this.canvases.map(canvas => canvas.key = null);
  }

  /*
   * Takes a cache key and returns an array of [canvas, hit]
   * canvas is a canvas reserved for the caller.
   * hit indicates whether there was a cache hit
   * The caller should not make assumptions about the state of the canvas if
   * there was not a cache hit.
   */
  getCanvas(key) {
    var canvasObjectIdx = this.canvases.findIndex(elem => elem.key === key);
    // If the key isn't in the cache then we want to grab the last element.
    if (canvasObjectIdx === -1) {
      canvasObjectIdx = this.canvases.length - 1;
    }
    const canvasObject = this.canvases.splice(canvasObjectIdx, 1)[0];
    var cacheHit = true;
    if (canvasObject.key !== key) {
      cacheHit = false;
      canvasObject.key = key;
      const ctx = canvasObject.canvas.getContext('2d');
      ctx.clearRect(
        0,
        0,
        canvasObject.canvas.width,
        canvasObject.canvas.height
      );
    }
    // Add this canvas to the front of the array (most recently used)
    this.canvases.unshift(canvasObject);
    return [canvasObject.canvas, cacheHit];
  }
}
