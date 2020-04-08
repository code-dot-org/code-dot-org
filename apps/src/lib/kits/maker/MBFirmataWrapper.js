import MBFirmataClient from '../../../third-party/maker/MBFirmataClient';

export default class MicrobitFirmataWrapper extends MBFirmataClient {
  constructor(port) {
    super(port);
    this.digitalCallbacks = [];
  }

  setPinMode(pin, mode) {
    // If setting a pin to input, start tracking it immediately
    if (mode === 0) {
      this.trackDigitalPin(pin);
    }
    super.setPinMode(pin, mode);
  }

  digitalRead(pin, callback) {
    callback(this.digitalInput[pin]);
  }
}
