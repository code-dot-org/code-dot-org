const CACHE_SIZE = 20;

export default class CanvasCache {
  constructor() {
    this.canvases = [];
    for (var i = 0; i < CACHE_SIZE; ++i) {
      this.canvases.push({
        lastUse: 0,
        canvas: document.createElement('canvas')
      });
    }
  }

  getClearCanvas() {
    //const canvasObject = this.canvases.find(elem => elem.inUse === false);
    const canvasObject = this.canvases.reduce((minObj, canvasObj) => canvasObj.lastUse < minObj.lastUse ? canvasObj : minObj, this.canvases[0]);
    canvasObject.lastUse = (new Date()).getTime();
    const ctx = canvasObject.canvas.getContext('2d');
    ctx.clearRect(0, 0, canvasObject.canvas.width, canvasObject.canvas.height);
    return canvasObject.canvas;
  }

  pingCanvas(canvas) {
    const canvasObject = this.canvases.find(elem => elem.canvas === canvas);
    canvasObject.lastUse = (new Date()).getTime();
  }
}
