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

  trackDigitalComponent(pin, callback) {
    this.digitalCallbacks.push({pin, callback});
  }

  receivedDigitalUpdate(chan, pinMask) {
    super.receivedDigitalUpdate(chan, pinMask);
    for (let i = 0; i < this.digitalCallbacks.length; i++) {
      let pin = this.digitalCallbacks[i].pin;
      let callback = this.digitalCallbacks[i].callback;
      // We add one here to translate from the 0/1 of digital input to the
      // first part of the 6-array input of button, see ExternalButton.js
      callback(pin, this.digitalInput[pin] + 1);
    }
  }
}
