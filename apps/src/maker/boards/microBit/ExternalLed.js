export default class ExternalLed {
  constructor(opts) {
    this.board = opts.board;
    this.pin = opts.pin;
    this.isOn = false;
    this.blinkIntervalID = null;
  }

  on() {
    clearInterval(this.blinkIntervalID); // If blink was called, turn blink off.
    this.setDigitalOutputOn();
  }

  off() {
    clearInterval(this.blinkIntervalID); // If blink was called, turn blink off.
    this.setDigitalOutputOff();
  }

  toggle() {
    return this.isOn ? this.off() : this.on();
  }

  blink(delay) {
    const toggleInternal = () => {
      return this.isOn ? this.setDigitalOutputOff() : this.setDigitalOutputOn();
    };
    this.off(); // Reset Led.
    this.blinkIntervalID = setInterval(toggleInternal.bind(this), delay);
  }

  setDigitalOutputOff() {
    this.board.setDigitalOutput(this.pin, 0);
    this.isOn = false;
  }

  setDigitalOutputOn() {
    this.board.setDigitalOutput(this.pin, 1);
    this.isOn = true;
  }
}
