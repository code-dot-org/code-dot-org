import {EventEmitter} from 'events';

// Transfer the acceleration units from milli-g to meters/second^2
// Round to the nearest hundredth
function unitsFromMGToMS2(val) {
  // Using 1024 as a divisor because the Microbit gives values between 0 and 1024
  // to represent the values between 0 and 1g
  let g = val / 1024;
  let ms2 = g * 9.81;
  return Math.floor(ms2 * 100) / 100;
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
        this.state.x !== this.board.mb.analogChannel[8] ||
        this.state.y !== this.board.mb.analogChannel[9] ||
        this.state.z !== this.board.mb.analogChannel[10]
      ) {
        this.state.x = this.board.mb.analogChannel[8];
        this.state.y = this.board.mb.analogChannel[9];
        this.state.z = this.board.mb.analogChannel[10];
        this.emit('change');
      }

      //TODO : implement 'shake' action
    });
    this.start();

    Object.defineProperties(this, {
      roll: {
        get: function() {
          let rads = Math.atan2(this.x, Math.hypot(this.y, this.z));

          return unitsFromMGToMS2(rads * (180 / Math.PI));
        }
      },
      pitch: {
        get: function() {
          let rads = Math.atan2(this.y, Math.hypot(this.x, this.z));

          return unitsFromMGToMS2(rads * (180 / Math.PI));
        }
      },
      inclination: {
        get: function() {
          let rads = Math.atan2(this.y, this.x);
          return unitsFromMGToMS2(rads * (180 / Math.PI));
        }
      },
      x: {
        get: function() {
          return this.board.mb.analogChannel[8];
        }
      },
      y: {
        get: function() {
          return this.board.mb.analogChannel[9];
        }
      },
      z: {
        get: function() {
          return this.board.mb.analogChannel[10];
        }
      },
      acceleration: {
        get: function() {
          let total = Math.sqrt(
            this.x * this.x + this.y * this.y + this.z * this.z
          );

          return unitsFromMGToMS2(total);
        }
      }
    });
  }

  start() {
    this.board.mb.streamAnalogChannel(8); // enable accelerometerX
    this.board.mb.streamAnalogChannel(9); // enable accelerometerY
    this.board.mb.streamAnalogChannel(10); // enable accelerometerZ
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
      return [
        unitsFromMGToMS2(this.x),
        unitsFromMGToMS2(this.y),
        unitsFromMGToMS2(this.z)
      ];
    }
    if (accelerationDirection === 'total') {
      return this.acceleration;
    }
    switch (accelerationDirection) {
      case 'x':
        return unitsFromMGToMS2(this.x);
      case 'y':
        return unitsFromMGToMS2(this.y);
      case 'z':
        return unitsFromMGToMS2(this.z);
    }
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(8);
    this.board.mb.stopStreamingAnalogChannel(9);
    this.board.mb.stopStreamingAnalogChannel(10);
  }
}
