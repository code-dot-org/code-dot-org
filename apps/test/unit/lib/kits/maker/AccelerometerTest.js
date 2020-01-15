import {expect} from '../../../../util/reconfiguredChai';
import Accelerometer from '@cdo/apps/lib/kits/maker/Accelerometer';
import {MicrobitStubBoard} from './makeStubBoard';
import {sensor_channels} from '@cdo/apps/lib/kits/maker/MicroBitConstants';

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
    boardClient.analogChannel[sensor_channels.accelX] = 3;
    boardClient.analogChannel[sensor_channels.accelY] = 49;
    boardClient.analogChannel[sensor_channels.accelZ] = 312;

    expect(accelerometer.x).to.equal(0.02);
    expect(accelerometer.y).to.equal(0.48);
    expect(accelerometer.z).to.equal(3.06);
  });

  it(`total accelerometer calculated from x,y,z milli-g sensor data and rounded to hundredth`, () => {
    // Seed the x, y, z channel with milli-g data
    boardClient.analogChannel[sensor_channels.accelX] = 3;
    boardClient.analogChannel[sensor_channels.accelY] = 49;
    boardClient.analogChannel[sensor_channels.accelZ] = 312;

    expect(accelerometer.acceleration).to.equal(3.09);
  });
});
