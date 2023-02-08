import {EventEmitter} from 'events';
import {SERIAL_BAUD} from '@cdo/apps/lib/kits/maker/util/boardUtils';

const DEVICE_LOST_ERROR_CODE = 19;

export default class WebSerialPortWrapper extends EventEmitter {
  constructor(port) {
    super();
    this.port = port;
    this.portOpen = false;

    if (port) {
      const portInfo = port.getInfo();
      this.vendorId = portInfo.usbVendorId;
      this.productId = portInfo.usbProductId;
    }

    this.writer = null;
    this.reader = null;
  }

  // Return a list of available ports
  list() {
    // TODO - not sure if this is used in Maker Toolkit yet
  }

  /** Opens the serial port from Micro:Bit and starts reading from port.
   * We are opening the port here and not reading from or writing to the port at this point in
   * implementation. Later on when the entire Micro:WebSerial pathway is implemented,
   * this function may be removed logic added for the MB in the open() function below,
   * if appropriate.
   */
  async openMBPort() {
    if (this.portOpen) {
      throw new Error(`Requested port is already open.`);
    }
    return this.port
      .open({baudRate: SERIAL_BAUD})
      .then(() => {
        this.portOpen = true;
        this.emit('open');
        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();

        this.readLoop();
      })
      .then(() => this)
      .catch(error => Promise.reject('Failure to open port: ' + error));
  }

  // Opens the serial port from Circuit Playground and starts reading from port.
  async open() {
    if (this.portOpen) {
      throw new Error(`Requested port is already open.`);
    }

    this.port
      .open({baudRate: SERIAL_BAUD})
      .then(() => {
        this.portOpen = true;
        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();
        this.emit('open');
        this.readLoop();
      })
      .then(() => this)
      .catch(error => Promise.reject('Failure to open port: ' + error));
  }

  async readLoop() {
    while (this.port.readable?.locked) {
      try {
        const {value, done} = await this.reader.read();
        if (done) {
          this.reader.releaseLock();
          break;
        }
        this.emit('data', Buffer.from(value));
      } catch (e) {
        console.error(e);
        if (e.code === DEVICE_LOST_ERROR_CODE) {
          this.emit('disconnect');
        }
      }
    }
  }

  write(buffer, encoding, callback) {
    if (!this.portOpen) {
      throw new Error('Requested port cannot be written to until it is open');
    }
    buffer = buffer instanceof ArrayBuffer ? buffer : new Uint8Array(buffer);
    return this.writer
      .write(buffer)
      .then(() => (callback ? callback() : null))
      .catch(error => Promise.reject('Failure to write to port: ' + error));
  }

  async close() {
    if (!this.portOpen) {
      return;
    }

    if (this.port.readable && this.port.readable.locked) {
      await this.reader.cancel();
      await this.reader.releaseLock();
    }

    await this.writer.releaseLock();

    await this.port.close();
    this.portOpen = false;
  }
}
