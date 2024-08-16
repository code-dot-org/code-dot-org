import {DAPLink, WebUSB} from 'dapjs';

import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
  MICROBIT_V1,
  MICROBIT_V2,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {setMicroBitFirmataUpdatePercent} from '@cdo/apps/maker/microBitRedux';
import {getStore} from '@cdo/apps/redux';

export default class MBFirmataUpdater {
  constructor() {
    // State value 'microbitFirmataUpdatePercent' is only updated when this instance variable changes.
    this.firmataUpdatePercent = 0;
  }

  detectMicroBitVersion(device) {
    // Detect micro:bit version V1 or V2 from the first 4 digits of the micro:bit's serial number
    // Documentation at https://support.microbit.org/support/solutions/articles/19000035697-what-are-the-usb-vid-pid-numbers-for-micro-bit
    const microBitId = device.serialNumber.substring(0, 4);
    let microBitVersion = null;
    if (MICROBIT_IDS_V1.includes(microBitId)) {
      microBitVersion = MICROBIT_V1;
    } else if (MICROBIT_IDS_V2.includes(microBitId)) {
      microBitVersion = MICROBIT_V2;
    }
    analyticsReporter.sendEvent(EVENTS.MAKER_SETUP_PAGE_MB_VERSION_EVENT, {
      'Microbit Version': microBitVersion,
    });

    return microBitVersion;
  }

  // Precondition: microBitVersion is assigned either MICROBIT_V1 or MICROBIT_V2
  getFirmataURLByVersion(microBitVersion) {
    if (microBitVersion !== MICROBIT_V1 && microBitVersion !== MICROBIT_V2) {
      throw new Error('micro:bit version is invalid.');
    }
    return microBitVersion === MICROBIT_V1
      ? MICROBIT_FIRMATA_V1_URL
      : MICROBIT_FIRMATA_V2_URL;
  }

  async updateMBFirmataVersioned() {
    const device = await navigator.usb.requestDevice({
      filters: [{vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID}],
    });
    const microBitVersion = this.detectMicroBitVersion(device);
    if (microBitVersion === null) {
      throw new Error('micro:bit version not detected correctly.');
    }
    const firmataUrl = this.getFirmataURLByVersion(microBitVersion);
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
      getStore().dispatch(setMicroBitFirmataUpdatePercent(null));
      analyticsReporter.sendEvent(
        EVENTS.MAKER_SETUP_PAGE_MB_UPDATE_ERROR_EVENT,
        {
          'Microbit Update Error': true,
        }
      );
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
