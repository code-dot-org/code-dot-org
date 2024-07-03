import MBFirmataUpdater from '@cdo/apps/lib/kits/maker/boards/microBit/MBFirmataUpdater';
import {
  MICROBIT_V1,
  MICROBIT_V2,
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import microBitReducer, {
  setMicroBitFirmataUpdatePercent,
} from '@cdo/apps/lib/kits/maker/microBitRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';

describe('MBFirmataUpdater', () => {
  const mbFirmataUpdater = new MBFirmataUpdater();
  describe('detectMicroBitVersion function', () => {
    it('returns correct version for micro:bit v1', () => {
      MICROBIT_IDS_V1.forEach(idPrefix => {
        const device = {serialNumber: idPrefix + '1234'};
        const version = mbFirmataUpdater.detectMicroBitVersion(device);
        expect(version).toBe(MICROBIT_V1);
      });
    });

    it('returns correct version for micro:bit v2', () => {
      MICROBIT_IDS_V2.forEach(idPrefix => {
        const device = {serialNumber: idPrefix + '1234'};
        const version = mbFirmataUpdater.detectMicroBitVersion(device);
        expect(version).toBe(MICROBIT_V2);
      });
    });

    it('returns null for device that is not micro:bit', () => {
      const device = {serialNumber: '88001234'};
      const version = mbFirmataUpdater.detectMicroBitVersion(device);
      expect(version).toBeNull();
    });
  });

  describe('getFirmataURLByVersion function', () => {
    it('returns correct URL for micro:bit v1', () => {
      const URL = mbFirmataUpdater.getFirmataURLByVersion(MICROBIT_V1);
      expect(URL).toBe(MICROBIT_FIRMATA_V1_URL);
    });

    it('returns correct URL for micro:bit v2', () => {
      const URL = mbFirmataUpdater.getFirmataURLByVersion(MICROBIT_V2);
      expect(URL).toBe(MICROBIT_FIRMATA_V2_URL);
    });

    it('throws an error if the micro:bit version is invalid', () => {
      expect(() => mbFirmataUpdater.getFirmataURLByVersion('v3')).toThrow(
        'micro:bit version is invalid.'
      );
    });
  });

  describe('setPercentUpdateComplete function', () => {
    beforeEach(() => {
      stubRedux();
      registerReducers({microBit: microBitReducer});
    });

    afterEach(() => {
      restoreRedux();
    });

    it('changes state value appropriately when rounded progress value has changed', () => {
      getStore().dispatch(setMicroBitFirmataUpdatePercent(3));
      mbFirmataUpdater.firmataUpdatePercent = 3;
      mbFirmataUpdater.setPercentUpdateComplete(0.034);
      expect(mbFirmataUpdater.firmataUpdatePercent).toBe(4);
      let percent = getStore().getState().microBit.microBitFirmataUpdatePercent;
      expect(percent).toBe(4);
    });

    it('does not change state value when rounded progress value has not changed', () => {
      getStore().dispatch(setMicroBitFirmataUpdatePercent(4));
      mbFirmataUpdater.firmataUpdatePercent = 4;
      mbFirmataUpdater.setPercentUpdateComplete(0.034);
      expect(mbFirmataUpdater.firmataUpdatePercent).toBe(4);
      let percent = getStore().getState().microBit.microBitFirmataUpdatePercent;
      expect(percent).toBe(4);
    });
  });
});
