export default class LedScreen {
  constructor(board) {
    this.board = board;
    this.screen = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
  }

  display(pixelArray) {
    this.board.mb.displayShow(/* useGrayscale */ false, pixelArray);
  }

  scrollString(value) {
    this.board.mb.scrollString(value);
  }

  scrollNumber(value) {
    this.board.mb.scrollInteger(value);
  }

  on(x, y, brightness = 255) {
    this.board.mb.displayPlot(x, y, brightness);
    this.screen[x][y] = 1;
  }

  off(x, y) {
    this.board.mb.displayPlot(x, y, 0);
    this.screen[x][y] = 0;
  }

  toggle(x, y, brightness = 255) {
    this.screen[x][y] > 0 ? this.off(x, y) : this.on(x, y, brightness);
  }

  clear() {
    this.board.mb.displayClear();
  }
}
