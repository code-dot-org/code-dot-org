import Compass from '@cdo/apps/lib/kits/maker/boards/microBit/Compass';
import {SENSOR_CHANNELS} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import {MBFirmataClientStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';

describe('MicroBit Compass', function () {
  let boardClient;
  let compass;

  beforeEach(() => {
    boardClient = new MBFirmataClientStub();
    compass = new Compass({mb: boardClient});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`attributes are readonly`, () => {
    let desc = Object.getOwnPropertyDescriptor(compass, 'heading');
    expect(desc.set).toBeUndefined();
    expect(desc.get).toBeDefined();
  });

  it(`magnetometer values calculated as expected and rounded to integer`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.magX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.magY] = 49;

    expect(compass.heading).toBe(86);
  });

  it(`getHeading() returns the heading attribute`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.magX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.magY] = 49;

    expect(compass.heading).toBe(86);
    expect(compass.getHeading()).toBe(86);
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = jest.spyOn(boardClient, 'streamAnalogChannel').mockClear();
      let stopSpy = jest
        .spyOn(boardClient, 'stopStreamingAnalogChannel')
        .mockClear();
      compass.start();
      expect(startSpy).toHaveBeenCalledTimes(2);
      expect(startSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.magX);
      expect(startSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.magY);

      compass.stop();
      expect(stopSpy).toHaveBeenCalledTimes(2);
      expect(stopSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.magX);
      expect(stopSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.magY);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = jest.spyOn(compass, 'emit').mockClear();
    });

    it('emits the data event when it receives data', () => {
      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('data');
    });

    it('emits the change event when it receives data that is different from previous', () => {
      // Set the 'magnetometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.magX] = 5;
      boardClient.analogChannel[SENSOR_CHANNELS.magY] = 12;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledWith('data');
      expect(emitSpy).toHaveBeenCalledWith('change');
    });

    it('emits the change event when only one variable changes', () => {
      // Set the 'magnetometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.magX] = 6;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledWith('change');
    });
  });
});
