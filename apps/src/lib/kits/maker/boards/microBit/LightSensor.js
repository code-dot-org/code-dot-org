import {EventEmitter} from 'events';
import {sensor_channels} from './MicroBitConstants';

export default class LightSensor extends EventEmitter {
  constructor(board) {
    super();
    this.threshold = 0;
    this.currentReading = 0;
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the light value has changed, update the local value and
      // trigger a change event
      if (
        this.currentReading !==
        this.board.mb.analogChannel[sensor_channels.lightSensor]
      ) {
        this.currentReading = this.board.mb.analogChannel[
          sensor_channels.lightSensor
        ];
        this.emit('change');
      }
    });
    this.start();

    Object.defineProperties(this, {
      value: {
        get: function() {
          return this.board.mb.analogChannel[sensor_channels.lightSensor];
        }
      },
      threshold: {
        get: function() {
          return this.threshold;
        }
      }
    });
  }

  start() {
    this.board.mb.enableLightSensor(); // enable light sensor
    this.board.mb.streamAnalogChannel(sensor_channels.lightSensor);
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(sensor_channels.lightSensor); // disable light sensor
  }

  //TODO
  getAveragedValue() {}

  //ToDo
  setThreshold() {}
}
