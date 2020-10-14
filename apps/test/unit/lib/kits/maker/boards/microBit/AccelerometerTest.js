import {expect} from '../../../../../../util/reconfiguredChai';
import Accelerometer from '@cdo/apps/lib/kits/maker/boards/microBit/Accelerometer';
import {MicrobitStubBoard} from '../makeStubBoard';
import {SENSOR_CHANNELS} from '@cdo/apps/lib/kits/maker/boards/microBit/MicroBitConstants';
import sinon from 'sinon';

describe('MicroBitAccelerometer', function() {
  let boardClient;
  let accelerometer;

  beforeEach(() => {
    boardClient = new MicrobitStubBoard();
    accelerometer = new Accelerometer({mb: boardClient});
  });

  it(`attributes are readonly`, () => {
    let attributes = [
      'roll',
      'pitch',
      'inclination',
      'x',
      'y',
      'z',
      'acceleration'
    ];
    let desc;

    attributes.forEach(attr => {
      desc = Object.getOwnPropertyDescriptor(accelerometer, attr);
      expect(desc.set).to.be.undefined;
      expect(desc.get).to.be.defined;
    });
  });

  it(`sensor values are computed from milli-g to meters/second^2 and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 49;
    boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 312;

    expect(accelerometer.x).to.equal(0.02);
    expect(accelerometer.y).to.equal(0.48);
    expect(accelerometer.z).to.equal(3.06);
  });

  it(`total accelerometer calculated from x,y,z milli-g sensor data and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 3;
    boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 49;
    boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 312;

    expect(accelerometer.acceleration).to.equal(3.09);
  });

  it(`pitch, roll, inclination are calculated from sensor data and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 5;
    boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 12;
    boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 5;

    expect(accelerometer.pitch).to.equal(62.78);
    expect(accelerometer.roll).to.equal(18.86);
    expect(accelerometer.inclination).to.equal(70.01);
  });

  describe(`start() and stop()`, () => {
    it(`trigger the parent call`, () => {
      let startSpy = sinon.spy(boardClient, 'streamAnalogChannel');
      let stopSpy = sinon.spy(boardClient, 'stopStreamingAnalogChannel');
      accelerometer.start();
      expect(startSpy).to.have.been.calledThrice;
      expect(startSpy).to.have.been.calledWith(SENSOR_CHANNELS.accelX);
      expect(startSpy).to.have.been.calledWith(SENSOR_CHANNELS.accelY);
      expect(startSpy).to.have.been.calledWith(SENSOR_CHANNELS.accelZ);

      accelerometer.stop();
      expect(stopSpy).to.have.been.calledThrice;
      expect(stopSpy).to.have.been.calledWith(SENSOR_CHANNELS.accelX);
      expect(stopSpy).to.have.been.calledWith(SENSOR_CHANNELS.accelY);
      expect(stopSpy).to.have.been.calledWith(SENSOR_CHANNELS.accelZ);
    });
  });

  describe(`getOrientation()`, () => {
    it(`triggers a call to the corresponding attribute`, () => {
      // Seed the x, y, z channel with milli-g data
      boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 5;
      boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 12;
      boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 5;

      expect(accelerometer.pitch).to.equal(
        accelerometer.getOrientation('pitch')
      );
      expect(accelerometer.roll).to.equal(accelerometer.getOrientation('roll'));
      expect(accelerometer.inclination).to.equal(
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
      expect(accelerometer.getAcceleration()).to.deep.equal([0.04, 0.11, 0.04]);
    });

    it(`total parameter returns acceleration`, () => {
      expect(accelerometer.getAcceleration('total')).to.equal(
        accelerometer.acceleration
      );
    });

    it(`x, y, z parameter returns x, y, z acceleration`, () => {
      expect(accelerometer.getAcceleration('x')).to.equal(accelerometer.x);
      expect(accelerometer.getAcceleration('y')).to.equal(accelerometer.y);
      expect(accelerometer.getAcceleration('z')).to.equal(accelerometer.z);
    });
  });

  describe('emitsEvent', () => {
    let emitSpy;
    beforeEach(() => {
      emitSpy = sinon.spy(accelerometer, 'emit');
    });

    it('emits the data event when it receives data', () => {
      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('data');
    });

    it('emits the change event when it receives data that is different from previous', () => {
      // Set the 'accelerometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 5;
      boardClient.analogChannel[SENSOR_CHANNELS.accelY] = 12;
      boardClient.analogChannel[SENSOR_CHANNELS.accelZ] = 5;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledWith('data');
      expect(emitSpy).to.have.been.calledWith('change');
    });

    it('emits the change event when only one variable changes', () => {
      // Set the 'accelerometer' to 0
      boardClient.receivedAnalogUpdate();

      // Seed the x, y, z channel with 'different' data
      boardClient.analogChannel[SENSOR_CHANNELS.accelX] = 6;

      boardClient.receivedAnalogUpdate();
      expect(emitSpy).to.have.been.calledWith('change');
    });

    it('emits the shake event when only one variable changes', () => {
      boardClient.receivedEvent(27, 11);
      expect(emitSpy).to.have.been.calledOnce;
      expect(emitSpy).to.have.been.calledWith('shake');
    });
  });
});
