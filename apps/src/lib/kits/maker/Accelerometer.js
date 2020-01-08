import {EventEmitter} from 'events';
import {sensor_channels, roundToHundredth} from './MicroBitConstants';

// Transfer the acceleration units from milli-g to meters/second^2
// Round to the nearest hundredth
function unitsFromMGToMS2(val) {
  // Using 1024 as a divisor because the Microbit gives values between 0 and 1024
  // to represent the values between 0 and 1g
  let g = val / 1024;
  let ms2 = g * 9.81;
  return roundToHundredth(ms2);
}

export default class Accelerometer extends EventEmitter {
  constructor(board) {
    super();
    this.state = {x: 0, y: 0, z: 0};
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the acceleration value has changed, update the local value and
      // trigger a change event
      if (
        this.state.x !== this.board.mb.analogChannel[sensor_channels.accelX] ||
        this.state.y !== this.board.mb.analogChannel[sensor_channels.accelY] ||
        this.state.z !== this.board.mb.analogChannel[sensor_channels.accelZ]
      ) {
        this.state.x = this.board.mb.analogChannel[sensor_channels.accelX];
        this.state.y = this.board.mb.analogChannel[sensor_channels.accelY];
        this.state.z = this.board.mb.analogChannel[sensor_channels.accelZ];
        this.emit('change');
      }

      //TODO : implement 'shake' action
    });
    this.start();

    Object.defineProperties(this, {
      roll: {
        get: function() {
          let rads = Math.atan2(this.x, Math.hypot(this.y, this.z));
          return roundToHundredth(rads * (180 / Math.PI));
        }
      },
      pitch: {
        get: function() {
          let rads = Math.atan2(this.y, Math.hypot(this.x, this.z));
          return roundToHundredth(rads * (180 / Math.PI));
        }
      },
      inclination: {
        get: function() {
          let rads = Math.atan2(this.y, this.x);
          return roundToHundredth(rads * (180 / Math.PI));
        }
      },
      x: {
        get: function() {
          return unitsFromMGToMS2(
            this.board.mb.analogChannel[sensor_channels.accelX]
          );
        }
      },
      y: {
        get: function() {
          return unitsFromMGToMS2(
            this.board.mb.analogChannel[sensor_channels.accelY]
          );
        }
      },
      z: {
        get: function() {
          return unitsFromMGToMS2(
            this.board.mb.analogChannel[sensor_channels.accelZ]
          );
        }
      },
      acceleration: {
        get: function() {
          return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }
      }
    });
  }

  start() {
    this.board.mb.streamAnalogChannel(sensor_channels.accelX); // enable accelerometerX
    this.board.mb.streamAnalogChannel(sensor_channels.accelY); // enable accelerometerY
    this.board.mb.streamAnalogChannel(sensor_channels.accelZ); // enable accelerometerZ
  }

  getOrientation(orientationType) {
    switch (orientationType) {
      case 'pitch':
        return this.pitch;
      case 'roll':
        return this.roll;
      case 'inclination':
        return this.inclination;
    }
  }

  getAcceleration(accelerationDirection) {
    if (undefined === accelerationDirection) {
      return [this.x, this.y, this.z];
    }
    if (accelerationDirection === 'total') {
      return this.acceleration;
    }
    switch (accelerationDirection) {
      case 'x':
        return this.x;
      case 'y':
        return this.y;
      case 'z':
        return this.z;
    }
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(sensor_channels.accelX);
    this.board.mb.stopStreamingAnalogChannel(sensor_channels.accelY);
    this.board.mb.stopStreamingAnalogChannel(sensor_channels.accelZ);
  }
}
