export default class ExternalLed {
  constructor(opts) {
    this.board = opts.board;
    this.pin = opts.pin;
    this.isOn = false;
    this.intervalID = null;
  }

  on() {
    this.board.setDigitalOutput(this.pin, 1);
    this.isOn = true;
  }

  off() {
    clearInterval(this.intervalID);
    this.board.setDigitalOutput(this.pin, 0);
    this.isOn = false;
  }

  toggle() {
    return this.isOn ? this.off() : this.on();
  }

  blink(delay) {
    this.off();
    this.intervalID = setInterval(this.toggle_.bind(this), delay);
  }

  toggle_() {
    return this.isOn ? this.off_() : this.on();
  }

  off_() {
    this.board.setDigitalOutput(this.pin, 0);
    this.isOn = false;
  }
}
