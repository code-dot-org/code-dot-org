import LightSensor from '@cdo/apps/maker/boards/microBit/LightSensor';
import {
  SENSOR_CHANNELS,
  MAX_LIGHT_SENSOR_VALUE,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {MBFirmataClientStub} from '@cdo/apps/maker/util/makeStubBoard';

describe('LightSensor', function () {
  let boardClient, lightSensor;

  beforeEach(() => {
    boardClient = new MBFirmataClientStub();
    lightSensor = new LightSensor({mb: boardClient});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it(`value attribute is readonly`, () => {
    let descriptor = Object.getOwnPropertyDescriptor(lightSensor, 'value');
    expect(descriptor.set).toBeUndefined();
    expect(descriptor.get).toBeDefined();
  });

  it(`threshold attribute can be read and set`, () => {
    let descriptor = Object.getOwnPropertyDescriptor(lightSensor, 'threshold');
    expect(descriptor.set).toBeDefined();
    expect(descriptor.get).toBeDefined();

    expect(lightSensor.state.threshold).toBe(128);
    lightSensor.state.threshold = 199;
    expect(lightSensor.state.threshold).toBe(199);
  });

  describe(`value is calculated between ranges`, () => {
    it(`with the default values of 0 and 255`, () => {
      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 0;
      expect(lightSensor.value).toBe(0);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] =
        MAX_LIGHT_SENSOR_VALUE;
      expect(lightSensor.value).toBe(MAX_LIGHT_SENSOR_VALUE);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 123;
      expect(lightSensor.value).toBe(123);
    });

    it(`after ranges are set to 10 and 110`, () => {
      lightSensor.setScale(10, 110);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 0;
      expect(lightSensor.value).toBe(10);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] =
        MAX_LIGHT_SENSOR_VALUE;
      expect(lightSensor.value).toBe(110);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 123;
      expect(lightSensor.value).toBe(58);
    });
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = jest.spyOn(boardClient, 'streamAnalogChannel').mockClear();
      let stopSpy = jest
        .spyOn(boardClient, 'stopStreamingAnalogChannel')
        .mockClear();
      lightSensor.start();
      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(startSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.lightSensor);

      lightSensor.stop();
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect(stopSpy).toHaveBeenCalledWith(SENSOR_CHANNELS.lightSensor);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = jest.spyOn(lightSensor, 'emit').mockClear();
    });

    describe('emits the data event', () => {
      it(`when the data value crosses into the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 123;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 135;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).toHaveBeenCalledWith('data');
      });

      it(`when the data value stays above the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 135;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 190;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).toHaveBeenCalledWith('data');
      });

      it(`when the data value falls below the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 135;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 100;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).toHaveBeenCalledWith('data');
      });
    });

    describe('does not emit the data event', () => {
      it(`when the value stays below the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 100;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 90;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).not.toHaveBeenCalled();
      });
    });

    describe('emits the change event', () => {
      it('when it receives data that is different from previous and above threshold', () => {
        // Set the 'currentReading' to 0
        boardClient.receivedAnalogUpdate();

        // Seed the light channel with 'different' data above threshold
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 200;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).toHaveBeenCalledWith('data');
        expect(emitSpy).toHaveBeenCalledWith('change');
      });
    });

    describe('does not emit the change event', () => {
      it('when it receives data that is different from previous and below threshold', () => {
        // Set the 'currentReading' to 0
        boardClient.receivedAnalogUpdate();

        // Seed the light channel with 'different' data above threshold
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 20;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).not.toHaveBeenCalled();
        expect(emitSpy).not.toHaveBeenCalledWith('data');
        expect(emitSpy).not.toHaveBeenCalledWith('change');
      });

      it('when it receives data that is the same as previous and above threshold', () => {
        // Set the 'currentReading' to 200
        lightSensor.state.currentReading = 200;

        // Seed the light channel with 'different' data above threshold
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 200;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).toHaveBeenCalledWith('data');
        expect(emitSpy).not.toHaveBeenCalledWith('change');
      });
    });
  });
});
