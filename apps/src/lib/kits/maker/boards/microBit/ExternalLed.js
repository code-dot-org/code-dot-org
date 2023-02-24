export default class ExternalLed {
  constructor(opts) {
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
    this.off();
    setInterval(this.toggle_.bind(this), delay);
  }

  toggle_() {
    return this.isOn ? this.off() : this.on();
  }
}
