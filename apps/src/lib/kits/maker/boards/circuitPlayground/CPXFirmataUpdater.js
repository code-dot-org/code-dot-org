import {
  CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL,
  ADAFRUIT_VENDOR_ID,
  CIRCUIT_PLAYGROUND_EXPRESS_BOOTLOADER_MODE_PRODUCT_ID,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';
import {DAPLink, WebUSB} from 'dapjs';

export default class CPXFirmataUpdater {
  async updateCPXFirmata() {
    console.log('update CPXFirmata');
    const device = await navigator.usb.requestDevice({
      filters: [
        {
          vendorId: ADAFRUIT_VENDOR_ID,
          productId: CIRCUIT_PLAYGROUND_EXPRESS_BOOTLOADER_MODE_PRODUCT_ID,
        },
      ],
    });
    const result = await fetch(CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL);

    if (!result.ok) {
      throw new Error('Failed to download file');
    }
    const resultText = await result.text();
    console.log('resultText', resultText);
    console.log('result', result);

    const transport = new WebUSB(device);
    const target = new DAPLink(transport);
    console.log('transport', transport);
    console.log('target', target);

    this.firmataUpdatePercent = 0;
    target.on(DAPLink.EVENT_PROGRESS, progress => {
      this.setPercentUpdateComplete(progress);
    });
    try {
      console.log('connect');
      await target.connect();
      console.log('flash');
      await target.flash(resultText);
      await target.disconnect();
    } catch (error) {
      console.log(error);
      return Promise.reject('Failed to flash Firmata.');
    }
  }
}
