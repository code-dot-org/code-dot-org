import {EventEmitter} from 'events';

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
      pitch: {
        get: function() {
          let rads = Math.atan2(this.x, Math.hypot(this.y, this.z));

          return (rads * (180 / Math.PI)).toFixed(2);
        }
      },
      roll: {
        get: function() {
          let rads = Math.atan2(this.y, Math.hypot(this.x, this.z));

          return (rads * (180 / Math.PI)).toFixed(2);
        }
      },
      inclination: {
        get: function() {
          return Math.atan2(this.y, this.x) * (180 / Math.PI).toFixed(2);
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
          return Math.sqrt(
            this.x * this.x + this.y * this.y + this.z * this.z
          ).toFixed(2);
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
      return [this.x.toFixed(2), this.y.toFixed(2), this.z.toFixed(2)];
    }
    if (accelerationDirection === 'total') {
      return this.acceleration;
    }
    switch (accelerationDirection) {
      case 'x':
        return this.x.toFixed(2);
      case 'y':
        return this.y.toFixed(2);
      case 'z':
        return this.z.toFixed(2);
    }
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(8);
    this.board.mb.stopStreamingAnalogChannel(9);
    this.board.mb.stopStreamingAnalogChannel(10);
  }
}
