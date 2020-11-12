import MBFirmataClient from '../../../../../third-party/maker/MBFirmataClient';
import {SAMPLE_INTERVAL} from './MicroBitConstants';
import {isNodeSerialAvailable} from '../../portScanning';

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

  // Used in setSerialPort
  dataReceived(data) {
    if (this.inbufCount + data.length < this.inbuf.length) {
      this.inbuf.set(data, this.inbufCount);
      this.inbufCount += data.length;
      this.processFirmatMessages();
    }
  }

  setSerialPort(port) {
    if (isNodeSerialAvailable()) {
      return super.setSerialPort(port);
    } else {
      // Use the given port. Assume the port has been opened by the caller.

      this.myPort = port;
      this.myPort.on('data', this.dataReceived.bind(this));
      this.requestFirmataVersion();
      this.requestFirmwareVersion();

      // get the board serial number (used to determine board version)
      this.boardVersion = '';
      return Promise.resolve();

      // The below code snippet is from the MBFirmataClient setSerialPort
      // that is not included in this branch for the ChromeSerialPort.
      // The Chrome Serial Port doesn't return .list() as a promise, so this\
      // code doesn't work in that library. As of 11/11/20, we do not use the
      // boardVersion in our MB integration.
      // TODO - rewrite this promise code to work for the Chrome Serial Port.
      /*
      // get the board serial number (used to determine board version)
      this.boardVersion = '';
      return serialport.list()
      .then((ports) => {
        for (var i = 0; i < ports.length; i++) {
          var p = ports[i];
          if ((p.comName == this.myPort.path)) {
            this.boardVersion = this.boardVersionFromSerialNumber(p.serialNumber);
          }
        }
        return null;
      })*/
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
