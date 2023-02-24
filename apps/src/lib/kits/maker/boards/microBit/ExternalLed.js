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

  blink(delay) {
    setInterval(this._toggle, delay);
  }

  _toggle() {
    if (this.isOn) {
      this.isOn = false;
      this.board.setDigitalOutput(this.pin, 0);
    } else {
      this.isOn = true;
      this.board.setDigitalOutput(this.pin, 1);
    }
  }
}
