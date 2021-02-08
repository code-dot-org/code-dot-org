import {EventEmitter} from 'events';
import {SENSOR_CHANNELS, roundToHundredth} from './MicroBitConstants';

export default class Compass extends EventEmitter {
  constructor(board) {
    super();
    this.state = {x: 0, y: 0};
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the magnetometer value has changed, update the local value and
      // trigger a change event
      if (
        this.state.x !== this.board.mb.analogChannel[SENSOR_CHANNELS.magX] ||
        this.state.y !== this.board.mb.analogChannel[SENSOR_CHANNELS.magY]
      ) {
        this.state.x = this.board.mb.analogChannel[SENSOR_CHANNELS.magX];
        this.state.y = this.board.mb.analogChannel[SENSOR_CHANNELS.magY];
        this.emit('change');
      }
    });
    this.start();

    Object.defineProperties(this, {
      heading: {
        get: function() {
          let rawX = this.board.mb.analogChannel[SENSOR_CHANNELS.magX];
          let rawY = this.board.mb.analogChannel[SENSOR_CHANNELS.magY];
          let heading = roundToHundredth(
            Math.atan2(rawY, rawX) * (180 / Math.PI)
          );
          if (heading > 360) {
            return heading - 360;
          } else if (heading < 0) {
            return heading + 360;
          }

          return heading;
        }
      }
    });
  }

  getHeading() {
    return this.heading;
  }

  start() {
    this.board.mb.streamAnalogChannel(SENSOR_CHANNELS.magX); // enable the magnetometer in the X orientation
    this.board.mb.streamAnalogChannel(SENSOR_CHANNELS.magY); // enable the magnetometer in the Y orientation
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(SENSOR_CHANNELS.magX);
    this.board.mb.stopStreamingAnalogChannel(SENSOR_CHANNELS.magY);
  }
}
