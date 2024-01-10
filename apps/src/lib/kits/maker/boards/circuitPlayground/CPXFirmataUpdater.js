import {
  CIRCUIT_PLAYGROUND_EXPRESS_FIRMATA_URL,
  ADAFRUIT_VENDOR_ID,
  CIRCUIT_PLAYGROUND_EXPRESS_BOOTLOADER_MODE_PRODUCT_ID,
} from '@cdo/apps/lib/kits/maker/boards/circuitPlayground/PlaygroundConstants';
import {DAPLink, WebUSB} from 'dapjs';
import {getStore} from '@cdo/apps/redux';
import {setMicroBitFirmataUpdatePercent} from '@cdo/apps/lib/kits/maker/microBitRedux';

export default class CPXFirmataUpdater {
  constructor() {
    // State value 'microbitFirmataUpdatePercent' is only updated when this instance variable changes.
    this.firmataUpdatePercent = 0;
  }

  async updateCPXFirmata() {
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
    const hexStr = await result.text();

    const transport = new WebUSB(device);
    const target = new DAPLink(transport);

    this.firmataUpdatePercent = 0;
    target.on(DAPLink.EVENT_PROGRESS, progress => {
      this.setPercentUpdateComplete(progress);
    });

    // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
    let hexAsBytes = new TextEncoder().encode(hexStr);
    try {
      // Push binary to board
      await target.connect();
      await target.flash(hexAsBytes);
      await target.disconnect();
    } catch (error) {
      console.log(error);
      return Promise.reject('Failed to flash Firmata.');
    }
  }

  setPercentUpdateComplete = progress => {
    if (progress !== null) {
      let percentComplete = Math.ceil(progress * 100);
      // 'progress' is a decimal value between 0.0 and 1.0 indicating the Firmata update percent completion.
      // If the rounded value is different from the value stored in the instance variable
      // 'firmataUpdatePercent', then we update the corresponding state value.
      if (percentComplete !== this.firmataUpdatePercent) {
        this.firmataUpdatePercent = percentComplete;
        getStore().dispatch(setMicroBitFirmataUpdatePercent(percentComplete));
      }
    }
  };
}
