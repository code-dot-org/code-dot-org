import {EventEmitter} from 'events';
import {SERIAL_BAUD} from '@cdo/apps/lib/kits/maker/util/boardUtils';

export default class WebSerialPortWrapper extends EventEmitter {
  constructor() {
    super();
    this.port = null;
    this.portOpen = false;
  }

  // Return a list of available ports
  list() {
    // TODO - not sure if this is used in Maker Toolkit yet
  }

  // Opens and returns a connection to the serial port referenced by the path. Returned port can
  // used to read and write.
  async open(port) {
    if (this.portOpen) {
      throw new Error(`Requested port is already open.`);
    }
    this.port = port;
    await port.open({baudRate: SERIAL_BAUD});
    this.portOpen = true;
  }
}
