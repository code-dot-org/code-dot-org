export default class ExternalLed {
  constructor(opts) {
    //TODO - limit to the GPIO pins on MB?
    this.board = opts.board;
    this.pin = opts.pin;
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
