import {expect} from '../../../../../../util/reconfiguredChai';
import Compass from '@cdo/apps/lib/kits/maker/boards/microBit/Compass';
import {MicrobitStubBoard} from '../makeStubBoard';
import {SENSOR_CHANNELS} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import sinon from 'sinon';

describe('MicroBit Compass', function() {
  let boardClient;
  let compass;

  beforeEach(() => {
    boardClient = new MicrobitStubBoard();
    compass = new Compass({mb: boardClient});
  });

  it(`attributes are readonly`, () => {
    let desc = Object.getOwnPropertyDescriptor(compass, 'heading');
    expect(desc.set).to.be.undefined;
    expect(desc.get).to.be.defined;
  });

  it(`magnetometer values calculated as expected and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.magX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.magY] = 49;

    expect(compass.heading).to.equal(86.49);
  });

  it(`getHeading() returns the heading attribute`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.magX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.magY] = 49;

    expect(compass.heading).to.equal(86.49);
    expect(compass.getHeading()).to.equal(86.49);
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = sinon.spy(boardClient, 'streamAnalogChannel');
      let stopSpy = sinon.spy(boardClient, 'stopStreamingAnalogChannel');
      compass.start();
      expect(startSpy).to.have.been.calledTwice;
      expect(startSpy).to.have.been.calledWith(SENSOR_CHANNELS.magX);
      expect(startSpy).to.have.been.calledWith(SENSOR_CHANNELS.magY);

      compass.stop();
      expect(stopSpy).to.have.been.calledTwice;
      expect(stopSpy).to.have.been.calledWith(SENSOR_CHANNELS.magX);
      expect(stopSpy).to.have.been.calledWith(SENSOR_CHANNELS.magY);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = sinon.spy(compass, 'emit');
    });

    it('emits the data event when it receives data', () => {
      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('data');
    });

    it('emits the change event when it receives data that is different from previous', () => {
      // Set the 'magnetometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.magX] = 5;
      boardClient.analogChannel[SENSOR_CHANNELS.magY] = 12;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledWith('data');
      expect(emitSpy).to.have.been.calledWith('change');
    });

    it('emits the change event when only one variable changes', () => {
      // Set the 'magnetometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.magX] = 6;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledWith('change');
    });
  });
});
