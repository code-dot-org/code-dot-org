import {EventEmitter} from 'events';
import {SENSOR_CHANNELS, roundToHundredth} from './MicroBitConstants';
import {ACCEL_EVENT_ID} from './MBFirmataWrapper';

// Transfer the acceleration units from milli-g to meters/second^2
// Round to the nearest hundredth
function unitsFromMGToMS2(val) {
  let g = val / 1000;
  let ms2 = g * 9.81;
  return roundToHundredth(ms2);
}

export default class Accelerometer extends EventEmitter {
  constructor(board) {
    super();
    // There are twelve sensor events, ['', 'up', 'down', 'left', 'right',
    // 'face-up', 'face-down', 'freefall', '3G', '6G', '8G', 'shake']
    this.state = {x: 0, y: 0, z: 0};
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the acceleration value has changed, update the local value and
      // trigger a change event
      if (
        this.state.x !== this.board.mb.analogChannel[SENSOR_CHANNELS.accelX] ||
        this.state.y !== this.board.mb.analogChannel[SENSOR_CHANNELS.accelY] ||
        this.state.z !== this.board.mb.analogChannel[SENSOR_CHANNELS.accelZ]
      ) {
        this.state.x = this.board.mb.analogChannel[SENSOR_CHANNELS.accelX];
        this.state.y = this.board.mb.analogChannel[SENSOR_CHANNELS.accelY];
        this.state.z = this.board.mb.analogChannel[SENSOR_CHANNELS.accelZ];
        this.emit('change');
      }
    });

    this.board.mb.addFirmataEventListener((sourceID, eventID) => {
      if (ACCEL_EVENT_ID === sourceID) {
        // The shake event is at the 11th index for sensor events
        if (eventID === 11) {
          this.emit('shake');
        }
      }
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
            this.board.mb.analogChannel[SENSOR_CHANNELS.accelX]
          );
        }
      },
      y: {
        get: function() {
          return unitsFromMGToMS2(
            this.board.mb.analogChannel[SENSOR_CHANNELS.accelY]
          );
        }
      },
      z: {
        get: function() {
          return unitsFromMGToMS2(
            this.board.mb.analogChannel[SENSOR_CHANNELS.accelZ]
          );
        }
      },
      acceleration: {
        get: function() {
          return roundToHundredth(
            Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
          );
        }
      }
    });
  }

  start() {
    this.board.mb.streamAnalogChannel(SENSOR_CHANNELS.accelX); // enable accelerometerX
    this.board.mb.streamAnalogChannel(SENSOR_CHANNELS.accelY); // enable accelerometerY
    this.board.mb.streamAnalogChannel(SENSOR_CHANNELS.accelZ); // enable accelerometerZ
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
    this.board.mb.stopStreamingAnalogChannel(SENSOR_CHANNELS.accelX);
    this.board.mb.stopStreamingAnalogChannel(SENSOR_CHANNELS.accelY);
    this.board.mb.stopStreamingAnalogChannel(SENSOR_CHANNELS.accelZ);
  }
}
