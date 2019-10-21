const CACHE_SIZE = 30;

export default class CanvasCache {
  constructor() {
    this.canvases = [];
    for (var i = 0; i < CACHE_SIZE; ++i) {
      this.canvases.push({
        key: null,
        canvas: document.createElement('canvas')
      });
    }
  }

  /*
   * Takes a cache key and returns an array of [canvas, hit]
   * canvas is a canvas reserved for the caller.
   * hit indicates whether there was a cache hit
   * The caller should not make assumptions about the state of the canvas if
   * there was not a cache hit.
   */
  getCanvas(key) {
    const canvasObjectIdx = this.canvases.findIndex(elem => elem.key === key);
    const canvasObject = this.canvases.splice(
      canvasObjectIdx !== -1 ? canvasObjectIdx : this.canvases.length - 1,
      1
    )[0];
    if (canvasObject.key !== key) {
      canvasObject.key = key;
      const ctx = canvasObject.canvas.getContext('2d');
      ctx.clearRect(
        0,
        0,
        canvasObject.canvas.width,
        canvasObject.canvas.height
      );
    }
    this.canvases.unshift(canvasObject);
    return [canvasObject.canvas, canvasObjectIdx !== -1];
  }
}
