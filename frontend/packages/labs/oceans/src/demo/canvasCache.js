const CACHE_SIZE = 20;

export default class CanvasCache {
  constructor() {
    this.canvases = [];
    for (var i = 0; i < CACHE_SIZE; ++i) {
      this.canvases.push({
        id: i,
        inUse: false,
        canvas: document.createElement('canvas')
      });
    }
  }

  getClearCanvas() {
    const canvasObject = this.canvases.find(elem => elem.inUse === false);
    canvasObject.inUse = true;
    const ctx = canvasObject.canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasObject.canvas.width, canvasObject.canvas.height);
    return canvasObject.canvas;
  }

  releaseCanvas(canvas) {
    const canvasObject = this.canvases.find(elem => elem.canvas === canvas);
    canvasObject.inUse = false;
  }
}
