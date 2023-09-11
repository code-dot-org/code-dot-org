import {expect} from '../../../../../../util/reconfiguredChai';
import {
  MICROBIT_V1,
  MICROBIT_V2,
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import MBFirmataUpdater from '@cdo/apps/lib/kits/maker/boards/microBit/MBFirmataUpdater';
import microBitReducer, {
  setMicroBitFirmataUpdatePercent,
} from '@cdo/apps/lib/kits/maker/microBitRedux';
import {
  getStore,
  registerReducers,
  __testing_stubRedux,
  __testing_restoreRedux,
} from '@cdo/apps/redux';

describe('MBFirmataUpdater', () => {
  const mbFirmataUpdater = new MBFirmataUpdater();
  describe('detectMicroBitVersion function', () => {
    it('returns correct version for micro:bit v1', () => {
      MICROBIT_IDS_V1.forEach(idPrefix => {
        const device = {serialNumber: idPrefix + '1234'};
        const version = mbFirmataUpdater.detectMicroBitVersion(device);
        expect(version).to.equal(MICROBIT_V1);
      });
    });

    it('returns correct version for micro:bit v2', () => {
      MICROBIT_IDS_V2.forEach(idPrefix => {
        const device = {serialNumber: idPrefix + '1234'};
        const version = mbFirmataUpdater.detectMicroBitVersion(device);
        expect(version).to.equal(MICROBIT_V2);
      });
    });

    it('returns null for device that is not micro:bit', () => {
      const device = {serialNumber: '88001234'};
      const version = mbFirmataUpdater.detectMicroBitVersion(device);
      expect(version).to.equal(null);
    });
  });

  describe('getFirmataURLByVersion function', () => {
    it('returns correct URL for micro:bit v1', () => {
      const URL = mbFirmataUpdater.getFirmataURLByVersion(MICROBIT_V1);
      expect(URL).to.equal(MICROBIT_FIRMATA_V1_URL);
    });

    it('returns correct URL for micro:bit v2', () => {
      const URL = mbFirmataUpdater.getFirmataURLByVersion(MICROBIT_V2);
      expect(URL).to.equal(MICROBIT_FIRMATA_V2_URL);
    });

    it('throws an error if the micro:bit version is invalid', () => {
      expect(() => mbFirmataUpdater.getFirmataURLByVersion('v3')).to.throw(
        'micro:bit version is invalid.'
      );
    });
  });

  describe('setPercentUpdateComplete function', () => {
    beforeEach(() => {
      __testing_stubRedux();
      registerReducers({microBit: microBitReducer});
    });

    afterEach(() => {
      __testing_restoreRedux();
    });

    it('changes state value appropriately when rounded progress value has changed', () => {
      getStore().dispatch(setMicroBitFirmataUpdatePercent(3));
      mbFirmataUpdater.firmataUpdatePercent = 3;
      mbFirmataUpdater.setPercentUpdateComplete(0.034);
      expect(mbFirmataUpdater.firmataUpdatePercent).to.equal(4);
      let percent = getStore().getState().microBit.microBitFirmataUpdatePercent;
      expect(percent).to.equal(4);
    });

    it('does not change state value when rounded progress value has not changed', () => {
      getStore().dispatch(setMicroBitFirmataUpdatePercent(4));
      mbFirmataUpdater.firmataUpdatePercent = 4;
      mbFirmataUpdater.setPercentUpdateComplete(0.034);
      expect(mbFirmataUpdater.firmataUpdatePercent).to.equal(4);
      let percent = getStore().getState().microBit.microBitFirmataUpdatePercent;
      expect(percent).to.equal(4);
    });
  });
});
