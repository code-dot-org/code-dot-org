import {EventEmitter} from 'events';
import {roundToHundredth, sensor_channels} from './MicroBitConstants';

export default class MicroBitThermometer extends EventEmitter {
  constructor(board) {
    super();
    this.currentTemp = 0;
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the temp value has changed, update the local value and
      // trigger a change event
      if (
        this.currentTemp !==
        this.board.mb.analogChannel[sensor_channels.tempSensor]
      ) {
        this.currentTemp = this.board.mb.analogChannel[
          sensor_channels.tempSensor
        ];
        this.emit('change');
      }
    });
    this.start();

    Object.defineProperties(this, {
      raw: {
        get: function() {
          return this.board.mb.analogChannel[sensor_channels.tempSensor];
        }
      },
      celsius: {
        get: function() {
          return this.raw;
        }
      },
      fahrenheit: {
        get: function() {
          let rawValue = (this.celsius * 9) / 5 + 32;
          return roundToHundredth(rawValue);
        }
      },
      C: {
        get: function() {
          return this.celsius;
        }
      },
      F: {
        get: function() {
          return this.fahrenheit;
        }
      }
    });
  }

  start() {
    this.board.mb.streamAnalogChannel(sensor_channels.tempSensor); // enable temp sensor
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(sensor_channels.tempSensor); // disable temp sensor
  }
}
