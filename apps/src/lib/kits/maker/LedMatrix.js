export default class LedMatrix {
  constructor(board) {
    this.board = board;
    this.matrix = [
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0]
    ];
  }

  scrollString(value) {
    this.board.mb.scrollString(value);
  }

  scrollInteger(value) {
    this.board.mb.scrollInteger(value);
  }

  on(x, y, brightness) {
    this.board.mb.displayPlot(x, y, brightness);
    this.matrix[x][y] = 1;
  }

  off(x, y) {
    this.board.mb.displayPlot(x, y, 0);
    this.matrix[x][y] = 0;
  }

  toggle(x, y, brightness) {
    this.matrix[x][y] > 0 ? this.off(x, y) : this.on(x, y, brightness);
  }

  allOff() {
    this.board.mb.displayClear();
  }
}

export class ExternalLed {
  constructor(board, pin) {
    //TODO - limit to the GPIO pins on MB?
    this.board = board;
    this.pin = pin;
    this.isOn = false;
  }

  on() {
    this.board.setDigitalOutput(this.pin, 1);
    this.isOn = true;
  }

  off() {
    this.board.setDigitalOutput(this.pin, 0);
    this.isOn = false;
  }

  toggle() {
    return this.isOn ? this.off() : this.on();
  }
}
