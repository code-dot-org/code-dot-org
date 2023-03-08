import {DOWNLOAD_PREFIX} from '@cdo/apps/lib/kits/maker/util/makerConstants';
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
    let microbitVersion = 'v1';
    const v1MicrobitIds = ['9900', '9901'];
    const v2MicrobitIds = ['9903', '9904', '9905', '9906'];
    if (v2MicrobitIds.includes(microbitId)) {
      microbitVersion = 'v2';
    } else if (!v1MicrobitIds.includes(microbitId)) {
      microbitVersion = null;
    }
    return microbitVersion;
  }

  async updateMBFirmataVersioned() {
    const device = await navigator.usb.requestDevice({
      filters: [{vendorId: 0x0d28, productId: 0x0204}]
    });
    const microbitVersion = this.detectMicrobitVersion(device);
    let firmataUrl = `${DOWNLOAD_PREFIX}microbit-firmata-v1-ver1.2.hex`;
    if (microbitVersion === 'v2') {
      firmataUrl = `${DOWNLOAD_PREFIX}microbit-firmata-v2-ver1.2.hex`;
    } else if (microbitVersion !== 'v1') {
      throw new Error('microbit version not detected correctly');
    }
    const result = await fetch(firmataUrl);

    if (!result.ok) {
      throw new Error('Failed to download hex file');
    }
    const hexStr = await result.text();

    const transport = new WebUSB(device);
    const target = new DAPLink(transport);

    this.firmataUpdatePercent = 0;
    target.on(DAPLink.EVENT_PROGRESS, progress => {
      this.getPercentUpdateComplete(progress);
    });

    // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
    let hexAsBytes = new TextEncoder().encode(hexStr);
    try {
      // Push binary to board
      await target.connect();
      await target.flash(hexAsBytes);
      console.log('flash complete - now disconnect');
      await target.disconnect();
    } catch (error) {
      console.log(error);
      return Promise.reject('Failed to flash Firmata.');
    }
  }

  getPercentUpdateComplete = progress => {
    if (progress) {
      let percentComplete = Math.ceil(progress * 100);
      // 'progress' is a decimal value between 0.0 and 1.0 indicating the Firmata update percent completion.
      // If the rounded value is different from the value stored in the static variable
      // 'firmataUpdatePercent', then we update the corresponding state value.
      if (percentComplete !== this.firmataUpdatePercent) {
        this.firmataUpdatePercent = percentComplete;
        getStore().dispatch(
          setMicrobitFirmataUpdatePercent(` ${percentComplete.toString()}%`)
        );
      }
    }
  };
}
