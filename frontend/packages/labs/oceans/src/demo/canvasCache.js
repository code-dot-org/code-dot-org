const CACHE_SIZE = 20;

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

  getCanvas(key) {
    const canvasObjectIdx = this.canvases.findIndex(elem => elem.key === key);
    const canvasObject = this.canvases.splice(canvasObjectIdx !== -1 ? canvasObjectIdx : this.canvases.length - 1, 1)[0];
    canvasObject.key = key;

    const ctx = canvasObject.canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasObject.canvas.width, canvasObject.canvas.height);
    this.canvases.unshift(canvasObject)
    return canvasObject.canvas;
  }
}
