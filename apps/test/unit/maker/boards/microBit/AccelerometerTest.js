import Accelerometer from '@cdo/apps/maker/boards/microBit/Accelerometer';
import {ACCEL_EVENT_ID} from '@cdo/apps/maker/boards/microBit/MBFirmataWrapper';
import {SENSOR_CHANNELS} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {MBFirmataClientStub} from '@cdo/apps/maker/util/makeStubBoard';

describe('MicroBitAccelerometer', function () {
  let boardClient;
  let accelerometer;

  beforeEach(() => {
    boardClient = new MBFirmataClientStub();
    accelerometer = new Accelerometer({mb: boardClient});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`attributes are readonly`, () => {
    let attributes = [
      'roll',
      'pitch',
      'inclination',
      'x',
      'y',
      'z',
      'acceleration',
    ];
    let desc;

    attributes.forEach(attr => {
      desc = Object.getOwnPropertyDescriptor(accelerometer, attr);
      expect(desc.set).toBeUndefined();
      expect(desc.get).toBeDefined();
    });
  });

  it(`sensor values are computed from milli-g to meters/second^2 and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 49;
    boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 312;

    expect(accelerometer.x).toBe(0.02);
    expect(accelerometer.y).toBe(0.48);
    expect(accelerometer.z).toBe(3.06);
  });

  it(`total accelerometer calculated from x,y,z milli-g sensor data and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 49;
    boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 312;

    expect(accelerometer.acceleration).toBe(3.09);
  });

  it(`pitch, roll, inclination are calculated from sensor data and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 5;
    boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 12;
    boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 5;

    expect(accelerometer.pitch).toBe(62.78);
    expect(accelerometer.roll).toBe(18.86);
    expect(accelerometer.inclination).toBe(70.01);
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = jest.spyOn(boardClient, 'streamAnalogChannel').mockClear();
      let stopSpy = jest
        .spyOn(boardClient, 'stopStreamingAnalogChannel')
        .mockClear();
      accelerometer.start();
      expect(startSpy).toHaveBeenCalledTimes(3);
      expect(startSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.accelX);
      expect(startSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.accelY);
      expect(startSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.accelZ);

      accelerometer.stop();
      expect(stopSpy).toHaveBeenCalledTimes(3);
      expect(stopSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.accelX);
      expect(stopSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.accelY);
      expect(stopSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.accelZ);
    });
  });

  describe(`getOrientation()`, () => {
    it(`triggers a call to the corresponding attribute`, () => {
      // Seed the x, y, z channel with milli-g data
      boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 5;
      boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 12;
      boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 5;

      expect(accelerometer.pitch).toBe(accelerometer.getOrientation('pitch'));
      expect(accelerometer.roll).toBe(accelerometer.getOrientation('roll'));
      expect(accelerometer.inclination).toBe(
        accelerometer.getOrientation('inclination')
      );
    });
  });

  describe(`getAcceleration()`, () => {
    beforeEach(() => {
      // Seed the x, y, z channel with milli-g data
      boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 5;
      boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 12;
      boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 5;
    });

    it(`undefined parameter returns an [x,y,z] array`, () => {
      expect(accelerometer.getAcceleration()).toEqual([0.04, 0.11, 0.04]);
    });

    it(`total parameter returns acceleration`, () => {
      expect(accelerometer.getAcceleration('total')).toBe(
        accelerometer.acceleration
      );
    });

    it(`x, y, z parameter returns x, y, z acceleration`, () => {
      expect(accelerometer.getAcceleration('x')).toBe(accelerometer.x);
      expect(accelerometer.getAcceleration('y')).toBe(accelerometer.y);
      expect(accelerometer.getAcceleration('z')).toBe(accelerometer.z);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = jest.spyOn(accelerometer, 'emit').mockClear();
    });

    it('emits the data event when it receives data', () => {
      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('data');
    });

    it('emits the change event when it receives data that is different from previous', () => {
      // Set the 'accelerometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 5;
      boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 12;
      boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 5;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledWith('data');
      expect(emitSpy).toHaveBeenCalledWith('change');
    });

    it('emits the change event when only one variable changes', () => {
      // Set the 'accelerometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 6;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).toHaveBeenCalledWith('change');
    });

    it('emits the shake event when only one variable changes', () => {
      boardClient.receivedEvent(ACCEL_EVENT_ID, 11);
      expect(emitSpy).toHaveBeenCalledTimes(1);
      expect(emitSpy).toHaveBeenCalledWith('shake');
    });
  });
});
