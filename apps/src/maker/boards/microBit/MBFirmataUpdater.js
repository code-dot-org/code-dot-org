import {DAPLink, WebUSB} from 'dapjs';

import {
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {
  detectMicroBitVersion,
  flashHexString,
  getFirmataURLByVersion,
} from '@cdo/apps/maker/boards/microBit/utils';
import {setMicroBitFirmataUpdatePercent} from '@cdo/apps/maker/microBitRedux';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';

export default class MBFirmataUpdater {
  constructor() {
    // State value 'microbitFirmataUpdatePercent' is only updated when this instance variable changes.
    this.firmataUpdatePercent = 0;
  }

  async updateMBFirmataVersioned() {
    const device = await navigator.usb.requestDevice({
      filters: [{vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID}],
    });
    const microBitVersion = detectMicroBitVersion(device);
    if (microBitVersion === null) {
      throw new Error('micro:bit version not detected correctly.');
    }
    const firmataUrl = getFirmataURLByVersion(microBitVersion);
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
    try {
      await flashHexString(hexStr, target);
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
