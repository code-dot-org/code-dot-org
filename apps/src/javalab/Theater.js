export default class Theater {
  constructor() {
    this.canvas = null;
  }

  afterInject() {
    this.canvas = document.getElementById('theater');
    debugger;
    let ctx = this.canvas.getContext('2d')
    if (ctx) {
      ctx.beginPath();
      ctx.arc(100, 100, 50, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      return true;
    }
  }
}