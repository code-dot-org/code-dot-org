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

  // Opens the serial port and starts reading from port.
  async open() {
    if (this.portOpen) {
      throw new Error(`Requested port is already open.`);
    }

    this.port
      .open({baudRate: SERIAL_BAUD})
      .then(() => {
        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();
      })
      .then(async () => {
        this.portOpen = true;
        this.emit('open');
        while (this.port.readable?.locked) {
          try {
            const {value, done} = await this.reader.read();
            if (done) {
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
      });
  }

  write(buffer, encoding, callback) {
    if (!this.portOpen) {
      throw new Error('Requested port cannot be written to until it is open');
    }
    console.log('Alpha');
    console.log(callback);
    return this.writer
      .write(buffer)
      .then(() => {
        console.log('Beta');
        return callback();
      })
      .catch(() => {
        console.log('Failed Write');
        console.log(callback);
      });
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
