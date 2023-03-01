export default class ExternalLed {
  constructor(opts) {
    this.board = opts.board;
    this.pin = opts.pin;
    this.isOn = false;
    this.blinkIntervalID = null;
  }

  on() {
    this.board.setDigitalOutput(this.pin, 1);
    this.isOn = true;
  }

  off() {
    clearInterval(this.blinkIntervalID); // If blink was called, turn blink off.
    this.clearDigitalOutput();
  }

  toggle() {
    return this.isOn ? this.off() : this.on();
  }

  blink(delay) {
    // simpleToggle only calls on clearDigitalOutput, not off so that it doesn't turn off blinking.
    const simpleToggle = () => {
      return this.isOn ? this.clearDigitalOutput() : this.on();
    };
    this.off(); // Reset Led.
    this.blinkIntervalID = setInterval(simpleToggle.bind(this), delay);
  }

  clearDigitalOutput() {
    this.board.setDigitalOutput(this.pin, 0);
    this.isOn = false;
  }
}
