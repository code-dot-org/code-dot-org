import {SENSOR_CHANNELS} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import MicroBitThermometer from '@cdo/apps/maker/boards/microBit/MicroBitThermometer';
import {MBFirmataClientStub} from '@cdo/apps/maker/util/makeStubBoard';

describe('MicroBitThermometer', function () {
  let boardClient, thermometer;

  beforeEach(() => {
    boardClient = new MBFirmataClientStub();
    thermometer = new MicroBitThermometer({mb: boardClient});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`attributes are readonly`, () => {
    let attributes = ['raw', 'celsius', 'fahrenheit', 'C', 'F'];
    let descriptor;

    attributes.forEach(attr => {
      descriptor = Object.getOwnPropertyDescriptor(thermometer, attr);
      expect(descriptor.set).toBeUndefined();
      expect(descriptor.get).toBeDefined();
    });
  });

  it(`fahrenheit is calculated from celsius`, () => {
    // Seed the temp channel with celsius data
    boardClient.analogChannel[SENSOR_CHANNELS.tempSensor] = 3;

    expect(thermometer.celsius).toBe(thermometer.C);
    expect(thermometer.celsius).toBe(3);

    expect(thermometer.fahrenheit).toBe(thermometer.F);
    expect(thermometer.fahrenheit).toBe(37.4);
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = jest.spyOn(boardClient, 'streamAnalogChannel').mockClear();
      let stopSpy = jest
        .spyOn(boardClient, 'stopStreamingAnalogChannel')
        .mockClear();
      thermometer.start();
      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(startSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.tempSensor);

      thermometer.stop();
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(stopSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.tempSensor);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = jest.spyOn(thermometer, 'emit').mockClear();
    });

    it('emits the data event when it receives data', () => {
      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('data');
    });

    it('emits the change event when it receives data that is different from previous', () => {
      // Set the 'current Temp' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the temp channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.tempSensor] = 3;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledWith('data');
      expect(emitSpy).toHaveBeenCalledWith('change');
    });
  });
});
