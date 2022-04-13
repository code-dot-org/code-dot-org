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
  }

  // Return a list of available ports
  list() {
    // TODO - not sure if this is used in Maker Toolkit yet
  }

  // Opens and returns a connection to the serial port referenced by the path. Returned port can
  // used to read and write.
  async open() {
    if (this.portOpen) {
      throw new Error(`Requested port is already open.`);
    }
    await this.port.open({baudRate: SERIAL_BAUD});
    this.portOpen = true;
  }
}
