import MBFirmataClient from '../../../third-party/maker/MBFirmataClient';
import {isWebSerialPort} from '../../util/boardUtils';

import {SAMPLE_INTERVAL} from './MicroBitConstants';

export const ACCEL_EVENT_ID = 13;

export default class MicroBitFirmataWrapper extends MBFirmataClient {
  constructor(portType) {
    super(portType);
    this.digitalCallbacks = [];
    this.serialPortWebSerial = null;
  }

  connectBoard(port) {
    return Promise.resolve()
      .then(() => this.setSerialPort(port))
      .then(() => {
        return this.setAnalogSamplingInterval(SAMPLE_INTERVAL);
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
      // This branch is for Maker app pathway.
      return super.setSerialPort(port);
    } else {
      // Use the given port. Assume the port has been opened by the caller.
      // This branch is for WebSerial pathway
      this.myPort = port; // port is a WebSerialPortWrapper
      this.serialPortWebSerial = port.port;
      this.myPort.on('data', this.dataReceived.bind(this));
      this.requestFirmataVersion();
      this.requestFirmwareVersion();

      return Promise.resolve();
    }
  }

  // Create and return a copy of this MBFirmataClient with references to the WebSerialPortWrapper
  // removed. This copy is assigned to the key 'board' in the prewiredComponents object in MicroBitBoard.js
  // Removing the references to the port avoids hitting a recursive loop (due to the emit functionality
  // that's included in the WebSerialPortWrapper) when we attempt to marshall the MBFirmataClient
  // object across to the interpreter.
  getBoardClientWithoutPort() {
    const boardClientWithoutPort = Object.assign({}, this);
    delete boardClientWithoutPort.serialPortWebSerial;
    delete boardClientWithoutPort.myPort;
    return boardClientWithoutPort;
  }

  async disconnect() {
    // Close and discard the serial port.
    if (!isWebSerialPort(this.myPort)) {
      super.disconnect();
    } else {
      return new Promise(resolve => {
        // It can take a moment for the reset() command to reach the board, so defer
        // closing the serialport for a moment.
        setTimeout(() => {
          // Close the serialport, cleaning it up properly so we can open it again
          // on the next run.
          if (
            this.serialPortWebSerial &&
            typeof this.serialPortWebSerial.close === 'function'
          ) {
            this.myPort.close();
          }
          this.webSerialSerialPort = null;
          resolve();
        }, 50);
      });
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
