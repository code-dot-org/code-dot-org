import sinon from 'sinon';

import LightSensor from '@cdo/apps/lib/kits/maker/boards/microBit/LightSensor';
import {
  SENSOR_CHANNELS,
  MAX_LIGHT_SENSOR_VALUE,
} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import {MBFirmataClientStub} from '@cdo/apps/lib/kits/maker/util/makeStubBoard';

import {expect} from '../../../../../../util/reconfiguredChai';

describe('LightSensor', function () {
  let boardClient, lightSensor;

  beforeEach(() => {
    boardClient = new MBFirmataClientStub();
    lightSensor = new LightSensor({mb: boardClient});
  });
  afterEach(() => {
    sinon.restore();
  });

  it(`value attribute is readonly`, () => {
    let descriptor = Object.getOwnPropertyDescriptor(lightSensor, 'value');
    expect(descriptor.set).to.be.undefined;
    expect(descriptor.get).to.not.be.undefined;
  });

  it(`threshold attribute can be read and set`, () => {
    let descriptor = Object.getOwnPropertyDescriptor(lightSensor, 'threshold');
    expect(descriptor.set).to.not.be.undefined;
    expect(descriptor.get).to.not.be.undefined;

    expect(lightSensor.state.threshold).to.equal(128);
    lightSensor.state.threshold = 199;
    expect(lightSensor.state.threshold).to.equal(199);
  });

  describe(`value is calculated between ranges`, () => {
    it(`with the default values of 0 and 255`, () => {
      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 0;
      expect(lightSensor.value).to.equal(0);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] =
        MAX_LIGHT_SENSOR_VALUE;
      expect(lightSensor.value).to.equal(MAX_LIGHT_SENSOR_VALUE);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 123;
      expect(lightSensor.value).to.equal(123);
    });

    it(`after ranges are set to 10 and 110`, () => {
      lightSensor.setScale(10, 110);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 0;
      expect(lightSensor.value).to.equal(10);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] =
        MAX_LIGHT_SENSOR_VALUE;
      expect(lightSensor.value).to.equal(110);

      boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 123;
      expect(lightSensor.value).to.equal(58);
    });
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = sinon.spy(boardClient, 'streamAnalogChannel');
      let stopSpy = sinon.spy(boardClient, 'stopStreamingAnalogChannel');
      lightSensor.start();
      expect(startSpy).to.have.been.calledOnce;
      expect(startSpy).to.have.been.calledWith(SENSOR_CHANNELS.lightSensor);

      lightSensor.stop();
      expect(stopSpy).to.have.been.calledOnce;
      expect(stopSpy).to.have.been.calledWith(SENSOR_CHANNELS.lightSensor);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = sinon.spy(lightSensor, 'emit');
    });

    describe('emits the data event', () => {
      it(`when the data value crosses into the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 123;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 135;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).to.have.been.calledWith('data');
      });

      it(`when the data value stays above the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 135;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 190;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).to.have.been.calledWith('data');
      });

      it(`when the data value falls below the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 135;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 100;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).to.have.been.calledWith('data');
      });
    });

    describe('does not emit the data event', () => {
      it(`when the value stays below the threshold`, () => {
        lightSensor.state.threshold = 128;
        lightSensor.state.currentReading = 100;
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 90;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).not.to.have.been.called;
      });
    });

    describe('emits the change event', () => {
      it('when it receives data that is different from previous and above threshold', () => {
        // Set the 'currentReading' to 0
        boardClient.receivedAnalogUpdate();

        // Seed the light channel with 'different' data above threshold
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 200;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).to.have.been.calledWith('data');
        expect(emitSpy).to.have.been.calledWith('change');
      });
    });

    describe('does not emit the change event', () => {
      it('when it receives data that is different from previous and below threshold', () => {
        // Set the 'currentReading' to 0
        boardClient.receivedAnalogUpdate();

        // Seed the light channel with 'different' data above threshold
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 20;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).not.to.have.been.called;
        expect(emitSpy).not.to.have.been.calledWith('data');
        expect(emitSpy).not.to.have.been.calledWith('change');
      });

      it('when it receives data that is the same as previous and above threshold', () => {
        // Set the 'currentReading' to 200
        lightSensor.state.currentReading = 200;

        // Seed the light channel with 'different' data above threshold
        boardClient.analogChannel[SENSOR_CHANNELS.lightSensor] = 200;

        boardClient.receivedAnalogUpdate();
        expect(emitSpy).to.have.been.calledWith('data');
        expect(emitSpy).not.to.have.been.calledWith('change');
      });
    });
  });
});
