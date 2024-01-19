import {
  CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL,
  ADAFRUIT_VENDOR_ID,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';
import * as webusb from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/flashUtils/webusb';

export default class CPXFirmataUpdater {
  async updateCPXFirmata() {
    console.log('update CPXFirmata');
    const device = await navigator.usb.requestDevice({
      filters: [
        {
          vendorId: ADAFRUIT_VENDOR_ID,
        },
      ],
    });
    console.log('device', device);
    const result = await fetch(CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL);

    if (!result.ok) {
      throw new Error('Failed to download file');
    }
    console.log('result', result);
    webusb.initAsync(device);

    // const load = webusb.USBAdapter.prototype.loadDevice;
    // webusb.USBAdapter.prototype.loadDevice = function (device: any) {
    //   console.log('loadDevice', device);
    //   return load.apply(this, arguments)
    // }




    try {
      // console.log('connect');
      // await target.connect();
      // console.log('flash');
      // await target.flash(resultArray);
      // await target.disconnect();
    } catch (error) {
      console.log(error);
      return Promise.reject('Failed to flash Firmata.');
    }
  }
}
