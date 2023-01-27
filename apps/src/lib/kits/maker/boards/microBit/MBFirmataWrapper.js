import MBFirmataClient from '../../../../../third-party/maker/MBFirmataClient';
import {SAMPLE_INTERVAL} from './MicroBitConstants';
import {isWebSerialPort} from '../../util/boardUtils';

export const ACCEL_EVENT_ID = 13;

export default class MicrobitFirmataWrapper extends MBFirmataClient {
  constructor(portType) {
    super(portType);
    this.digitalCallbacks = [];
  }

  connectBoard(port) {
    return Promise.resolve()
      .then(() => this.setSerialPort(port))
      .then(() => {
        // webserial pathway - only opening/closing port for now
        if (!isWebSerialPort(port)) {
          return this.setAnalogSamplingInterval(SAMPLE_INTERVAL);
        }
      })
      .catch(() => {
        return Promise.reject("Couldn't connect to board");
      });
  }

  // Used in setSerialPort, which is copied from setSerialPort in MBFirmataClient,
  // as a wrapper. Lifted into its own function because of linting.
  dataReceived(data) {
    if (this.inbufCount + data.length < this.inbuf.length) {
      this.inbuf.set(data, this.inbufCount);
      this.inbufCount += data.length;
      this.processFirmatMessages();
    }
  }

  setSerialPort(port) {
    if (!isWebSerialPort(port)) {
      // maker app pathway
      return super.setSerialPort(port);
    } else {
      // Use the given port. Assume the port has been opened by the caller.
      // webserial pathway - only opening/closing port for now
      this.myPort = port;
      this.myPort.on('data', this.dataReceived.bind(this));

      return Promise.resolve();
    }
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
