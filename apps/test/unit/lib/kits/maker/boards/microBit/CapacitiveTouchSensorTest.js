import CapacitiveTouchSensor from '@cdo/apps/lib/kits/maker/boards/microBit/CapacitiveTouchSensor';
import {MBFirmataClientStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';

describe('CapacitiveTouchSensor', function () {
  let boardClient, sensor;
  let testPin = 2;

  beforeEach(() => {
    boardClient = new MBFirmataClientStub();
    sensor = new CapacitiveTouchSensor({mb: boardClient, pin: testPin});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`attributes are readonly`, () => {
    let isPressedDescriptor = Object.getOwnPropertyDescriptor(
      sensor,
      'isPressed'
    );
    expect(isPressedDescriptor.set).toBeUndefined();
    expect(isPressedDescriptor.get).toBeDefined();
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = jest.spyOn(boardClient, 'streamAnalogChannel').mockClear();
      let stopSpy = jest
        .spyOn(boardClient, 'stopStreamingAnalogChannel')
        .mockClear();
      sensor.start();
      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(startSpy).toHaveBeenCalledWith(testPin);
      expect(sensor.readSensorTimer).not.toBeNull();

      sensor.stop();
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(stopSpy).toHaveBeenCalledWith(testPin);
      expect(sensor.readSensorTimer).toBeNull();
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;

    beforeEach(() => {
      emitSpy = jest.spyOn(sensor, 'emit').mockClear();
    });

    afterEach(() => {
      emitSpy.mockRestore();
    });

    it('emits the down event when it receives a high enough reading', async () => {
      boardClient.receivedAnalogUpdate();

      // Seed the channel with 'unconnected' data
      boardClient.analogChannel[testPin] = 224;
      boardClient.receivedAnalogUpdate();

      // Seed the channel with 'connected' data
      boardClient.analogChannel[testPin] = 450;

      // Wait for readSensorTimer to finish
      await new Promise(resolve => setInterval(resolve, 50));

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('down');
    });

    it('emits the up event when it receives a low enough reading', async () => {
      boardClient.receivedAnalogUpdate();

      // Seed the channel with 'connected' data
      boardClient.analogChannel[testPin] = 450;
      boardClient.receivedAnalogUpdate();
      sensor.connected = true;

      // Seed the channel with 'unconnected' data
      boardClient.analogChannel[testPin] = 230;

      // Wait for readSensorTimer to finish
      await new Promise(resolve => setInterval(resolve, 50));

      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('up');
    });
  });
});
