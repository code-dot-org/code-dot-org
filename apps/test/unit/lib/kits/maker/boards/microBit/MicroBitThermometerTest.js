import {MicrobitStubBoard} from '../makeStubBoard';
import {expect} from '../../../../../../util/reconfiguredChai';
import sinon from 'sinon';
import MicroBitThermometer from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitThermometer';
import {SENSOR_CHANNELS} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';

describe('MicroBitThermometer', function() {
  let boardClient, thermometer;

  beforeEach(() => {
    boardClient = new MicrobitStubBoard();
    thermometer = new MicroBitThermometer({mb: boardClient});
  });

  it(`attributes are readonly`, () => {
    let attributes = ['raw', 'celsius', 'fahrenheit', 'C', 'F'];
    let descriptor;

    attributes.forEach(attr => {
      descriptor = Object.getOwnPropertyDescriptor(thermometer, attr);
      expect(descriptor.set).to.be.undefined;
      expect(descriptor.get).to.not.be.undefined;
    });
  });

  it(`fahrenheit is calculated from celsius`, () => {
    // Seed the temp channel with celsius data
    boardClient.analogChannel[SENSOR_CHANNELS.tempSensor] = 3;

    expect(thermometer.celsius).to.equal(thermometer.C);
    expect(thermometer.celsius).to.equal(3);

    expect(thermometer.fahrenheit).to.equal(thermometer.F);
    expect(thermometer.fahrenheit).to.equal(37.4);
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = sinon.spy(boardClient, 'streamAnalogChannel');
      let stopSpy = sinon.spy(boardClient, 'stopStreamingAnalogChannel');
      thermometer.start();
      expect(startSpy).to.have.been.calledOnce;
      expect(startSpy).to.have.been.calledWith(SENSOR_CHANNELS.tempSensor);

      thermometer.stop();
      expect(stopSpy).to.have.been.calledOnce;
      expect(stopSpy).to.have.been.calledWith(SENSOR_CHANNELS.tempSensor);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = sinon.spy(thermometer, 'emit');
    });

    it('emits the data event when it receives data', () => {
      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('data');
    });

    it('emits the change event when it receives data that is different from previous', () => {
      // Set the 'current Temp' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the temp channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.tempSensor] = 3;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledWith('data');
      expect(emitSpy).to.have.been.calledWith('change');
    });
  });
});
