import {MicrobitStubBoard} from '../makeStubBoard';
import {expect} from '../../../../../../util/reconfiguredChai';
import sinon from 'sinon';
import CapacitiveTouchSensor from '@cdo/apps/lib/kits/maker/boards/microBit/CapacitiveTouchSensor';

describe('CapacitiveTouchSensor', function() {
  let boardClient, sensor;
  let testPin = 2;

  beforeEach(() => {
    boardClient = new MicrobitStubBoard();
    sensor = new CapacitiveTouchSensor({mb: boardClient, pin: testPin});
  });

  it(`attributes are readonly`, () => {
    let isPressedDescriptor = Object.getOwnPropertyDescriptor(
      sensor,
      'isPressed'
    );
    expect(isPressedDescriptor.set).to.be.undefined;
    expect(isPressedDescriptor.get).to.not.be.undefined;
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = sinon.spy(boardClient, 'streamAnalogChannel');
      let stopSpy = sinon.spy(boardClient, 'stopStreamingAnalogChannel');
      sensor.start();
      expect(startSpy).to.have.been.calledOnce;
      expect(startSpy).to.have.been.calledWith(testPin);
      expect(sensor.readSensorTimer).to.not.be.null;

      sensor.stop();
      expect(stopSpy).to.have.been.calledOnce;
      expect(stopSpy).to.have.been.calledWith(testPin);
      expect(sensor.readSensorTimer).to.be.null;
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;

    beforeEach(() => {
      emitSpy = sinon.spy(sensor, 'emit');
    });

    afterEach(() => {
      emitSpy.restore();
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

      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('down');
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

      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('up');
    });
  });
});
