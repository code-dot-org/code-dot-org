/** @file Wrapper around Johnny-Five Led component */
import five from '@code-dot-org/johnny-five';

export default class Led extends five.Led {
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
