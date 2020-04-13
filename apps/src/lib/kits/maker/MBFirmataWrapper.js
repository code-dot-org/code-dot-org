import MBFirmataClient from '../../../third-party/maker/MBFirmataClient';

export default class MicrobitFirmataWrapper extends MBFirmataClient {
  setPinMode(pin, mode) {
    // If setting a pin to input, start tracking it immediately
    if (mode === 0) {
      this.trackDigitalPin(pin);
    } else if (mode === 2) {
      // If setting a pin to analog_input, start tracking it immediately
      this.streamAnalogChannel(pin);
    }
    super.setPinMode(pin, mode);
  }

  digitalRead(pin, callback) {
    callback(this.digitalInput[pin]);
  }

  analogRead(pin, callback) {
    callback(this.analogChannel[pin]);
  }

  reset() {
    if (this.myPort) {
      this.myPort.write([this.SYSTEM_RESET]);
    }
  }
}
