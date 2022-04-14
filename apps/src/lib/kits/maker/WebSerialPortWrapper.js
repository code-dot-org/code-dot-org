import {EventEmitter} from 'events';
import {SERIAL_BAUD} from '@cdo/apps/lib/kits/maker/util/boardUtils';

export default class WebSerialPortWrapper extends EventEmitter {
  constructor(port) {
    super();
    this.port = port;
    this.portOpen = false;

    const portInfo = port.getInfo();
    this.vendorId = portInfo.usbVendorId;
    this.productId = portInfo.usbProductId;

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

    Promise.resolve()
      .then(() => {
        return this.port.open({baudRate: SERIAL_BAUD});
      })
      .then(() => {
        this.writer = this.port.writable.getWriter();
        this.reader = this.port.readable.getReader();
      })
      .then(async () => {
        this.portOpen = true;
        this.emit('open');
        while (this.port.readable.locked) {
          try {
            const {value, done} = await this.reader.read();
            if (done) {
              break;
            }
            this.emit('data', Buffer.from(value));
          } catch (e) {
            console.error(e);
          }
        }
      });
  }

  write(buffer, encoding, callback) {
    if (!this.portOpen) {
      throw new Error('Requested port cannot be written to until it is open');
    }
    return this.writer.write(buffer).then(() => callback());
  }
}
