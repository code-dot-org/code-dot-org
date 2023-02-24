/** @file Extended Johnny-Five Led component with Code.org-specific behavior */
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
