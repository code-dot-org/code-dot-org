import {
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
  MICROBIT_V1,
  MICROBIT_V2
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import {DAPLink, WebUSB} from 'dapjs';
import {getStore} from '@cdo/apps/redux';
import {setMicrobitFirmataUpdatePercent} from '@cdo/apps/lib/kits/maker/microbitRedux';
import {EventEmitter} from 'events'; // provided by webpack's node-libs-browser

export default class MBFirmataUpdater extends EventEmitter {
  constructor() {
    super();
    // State value 'microbitFirmataUpdatePercent' is only updated when this instance variable changes.
    this.firmataUpdatePercent = 0;
  }

  detectMicrobitVersion(device) {
    // Detect micro:bit version and select the right Intel Hex for micro:bit V1 or V2
    const microbitId = device.serialNumber.substring(0, 4);
    let microbitVersion = null;
    if (MICROBIT_IDS_V1.includes(microbitId)) {
      microbitVersion = MICROBIT_V1;
    } else if (MICROBIT_IDS_V2.includes(microbitId)) {
      microbitVersion = MICROBIT_V2;
    }
    return microbitVersion;
  }

  async updateMBFirmataVersioned() {
    const device = await navigator.usb.requestDevice({
      filters: [{vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID}]
    });
    const microbitVersion = this.detectMicrobitVersion(device);
    if (microbitVersion === null) {
      throw new Error('micro:bit version not detected correctly.');
    }
    const firmataUrl =
      microbitVersion === MICROBIT_V1
        ? MICROBIT_FIRMATA_V1_URL
        : MICROBIT_FIRMATA_V2_URL;
    const result = await fetch(firmataUrl);

    if (!result.ok) {
      throw new Error('Failed to download hex file');
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
      getStore().dispatch(setMicrobitFirmataUpdatePercent(null));
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
        getStore().dispatch(setMicrobitFirmataUpdatePercent(percentComplete));
      }
    }
  };
}
