import MBFirmataClient from '../../../../../third-party/maker/MBFirmataClient';
import {SAMPLE_INTERVAL} from './MicroBitConstants';
import {isChromeOS} from '@cdo/apps/lib/kits/maker/util/browserChecks';

export const ACCEL_EVENT_ID = 27;

export default class MicrobitFirmataWrapper extends MBFirmataClient {
  constructor(SerialPort) {
    super(SerialPort);
    this.digitalCallbacks = [];
  }

  connectBoard(port) {
    return Promise.resolve()
      .then(() => this.setSerialPort(port))
      .then(() => {
        return this.setAnalogSamplingInterval(SAMPLE_INTERVAL);
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
    if (!isChromeOS()) {
      return super.setSerialPort(port);
    } else {
      // Use the given port. Assume the port has been opened by the caller.

      this.myPort = port;
      this.myPort.on('data', this.dataReceived.bind(this));
      this.requestFirmataVersion();
      this.requestFirmwareVersion();

      // get the board serial number (used to determine board version)
      this.boardVersion = '';

      // Above code is directly from setSerialPort in MBFirmataClient.
      // Returning an empty promise below because Chrome Serial Port doesn't return
      // .list() as a promise, as expected in MBFirmataClient. Because of the empty
      // promise we don't set this.boardVersion. As of this edit, we do not use the
      // boardVersion in our MB integration so no impact.
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
