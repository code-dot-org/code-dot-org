import {EventEmitter} from 'events';
import {sensor_channels, roundToHundredth} from './MicroBitConstants';

export default class Compass extends EventEmitter {
  constructor(board) {
    super();
    this.state = {x: 0};
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the magnetometer value has changed, update the local value and
      // trigger a change event
      if (this.state.x !== this.board.mb.analogChannel[sensor_channels.magX]) {
        this.state.x = this.board.mb.analogChannel[sensor_channels.magX];
        this.emit('change');
      }
    });
    this.start();

    Object.defineProperties(this, {
      heading: {
        get: function() {
          return roundToHundredth(
            this.board.mb.analogChannel[sensor_channels.magX]
          );
        }
      }
    });
  }

  start() {
    this.board.mb.streamAnalogChannel(sensor_channels.magX); // enable the magnetometer in the X orientation
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(sensor_channels.magX);
  }
}
