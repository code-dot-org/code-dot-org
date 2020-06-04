/** @file Wrapper around Johnny-Five NeoPixel component */
import five from '@code-dot-org/johnny-five';

export default class NeoPixel extends five.Led.RGB {
  on() {
    this.stop();
    return super.on();
  }

  off() {
    this.stop();
    return super.off();
  }

  toggle() {
    return this.isOn ? super.off() : super.on();
  }
}
