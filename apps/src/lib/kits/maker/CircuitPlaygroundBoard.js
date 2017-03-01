/** @file Board controller for Adafruit Circuit Playground */
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser
import ChromeSerialPort from 'chrome-serialport';
import five from 'johnny-five';
import Playground from 'playground-io';

/** @const {number} serial port transfer rate */
const SERIAL_BAUD = 57600;

/**
 * Controller interface for an Adafruit Circuit Playground board using
 * Circuit Playground Firmata firmware.
 */
export default class CircuitPlaygroundBoard extends EventEmitter {
  constructor(portName) {
    super();

    /** @private {string} a port identifier, e.g. "/dev/ttyACM0" */
    this.portName_ = portName;

    /** @private {five.Board} A johnny-five board controller */
    this.fiveBoard_ = null;
  }

  /**
   * Open a connection to the board on its configured port.
   * @return {Promise}
   */
  connect() {
    return new Promise((resolve, reject) => {
      const serialPort = CircuitPlaygroundBoard.openSerialPort(this.portName_);
      const playground = CircuitPlaygroundBoard.makePlaygroundTransport(serialPort);
      const board = new five.Board({io: playground, repl: false});
      board.once('ready', () => {
        this.fiveBoard_ = board;
        resolve();
      });
      board.once('error', reject);
    });
  }

  /**
   * Create a serial port controller and open the serial port immediately.
   * @param {string} portName
   * @return {SerialPort}
   */
  static openSerialPort(portName) {
    return new ChromeSerialPort.SerialPort(portName, {
      bitrate: SERIAL_BAUD
    }, true);
  }

  /**
   * Create a playground-io controller attached to the given serial port.
   * @param {SerialPort} serialPort
   * @return {Playground}
   */
  static makePlaygroundTransport(serialPort) {
    const playground = new Playground({ port: serialPort });
    // Circuit Playground Firmata does not seem to proactively report its
    // version, meaning we were hitting the default 5000ms timeout waiting
    // for this on every connection attempt.
    // Here we explicitly request a version as soon as the serialport is open
    // to speed up the connection process.
    playground.on("open", function () {
      // Requesting the version requires both of these calls. ¯\_(ツ)_/¯
      playground.reportVersion(function () {});
      playground.queryFirmware(function () {});
    });
    return playground;
  }
}
