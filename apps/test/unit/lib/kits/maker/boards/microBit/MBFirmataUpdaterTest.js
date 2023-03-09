import {expect} from '../../../../../../util/reconfiguredChai';
import {
  MICROBIT_V1,
  MICROBIT_V2,
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import MBFirmataUpdater from '@cdo/apps/lib/kits/maker/boards/microBit/MBFirmataUpdater';

describe('MBFirmataUpdater', () => {
  it('detectMicroBitVersion returns correct version', () => {
    const mbFirmataUpdater = new MBFirmataUpdater();
    let device = {serialNumber: '99001234'};
    let version = mbFirmataUpdater.detectMicroBitVersion(device);
    expect(version).to.equal(MICROBIT_V1);
    device = {serialNumber: '99039876'};
    version = mbFirmataUpdater.detectMicroBitVersion(device);
    expect(version).to.equal(MICROBIT_V2);
    device = {serialNumber: '88001234'};
    version = mbFirmataUpdater.detectMicroBitVersion(device);
    expect(version).to.equal(null);
  });

  it('getFirmataURLByVersion returns correct URL', () => {
    const mbFirmataUpdater = new MBFirmataUpdater();
    let URL = mbFirmataUpdater.getFirmataURLByVersion(MICROBIT_V1);
    expect(URL).to.equal(MICROBIT_FIRMATA_V1_URL);
    URL = mbFirmataUpdater.getFirmataURLByVersion(MICROBIT_V2);
    expect(URL).to.equal(MICROBIT_FIRMATA_V2_URL);
  });
});
