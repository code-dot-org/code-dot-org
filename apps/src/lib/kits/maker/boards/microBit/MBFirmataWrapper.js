import MBFirmataClient from '../../../../../third-party/maker/MBFirmataClient';
import {SAMPLE_RATE} from './MicroBitConstants';

export const ACCEL_EVENT_ID = 27;

export default class MicrobitFirmataWrapper extends MBFirmataClient {
  constructor(SerialPort) {
    super(SerialPort);
    this.digitalCallbacks = [];
  }

  connectBoard() {
    return Promise.resolve()
      .then(() => this.connect())
      .then(() => {
        return this.setAnalogSamplingInterval(SAMPLE_RATE);
      });
  }

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

  trackDigitalComponent(pin, callback) {
    this.digitalCallbacks.push({pin, callback});
  }

  receivedDigitalUpdate(chan, pinMask) {
    super.receivedDigitalUpdate(chan, pinMask);
    for (let i = 0; i < this.digitalCallbacks.length; i++) {
      let pin = this.digitalCallbacks[i].pin;
      let callback = this.digitalCallbacks[i].callback;
      // Translate 0/1 to 1/2 corresponding to ExternalButton.boardEvents[1/2]
      // for 'down'/'up'
      callback(pin, this.digitalInput[pin] + 1);
    }
  }
}
