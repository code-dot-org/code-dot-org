import {EventEmitter} from 'events';
import {sensor_channels} from './MicroBitConstants';

export default class LightSensor extends EventEmitter {
  constructor(board) {
    super();
    this.threshold = 128;
    this.rangeMin = 0;
    this.rangeMax = 255;
    this.currentReading = 0;
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      // Only emit the data event when the value is above the threshold or the
      // previous reading was above the threshold
      if (
        this.this.board.mb.analogChannel[sensor_channels.lightSensor] >=
          this.threshold ||
        this.currentReading >= this.threshold
      ) {
        this.emit('data');
      }

      // If the light value has changed, update the local value and
      // trigger a change event
      if (
        this.currentReading !==
        this.board.mb.analogChannel[sensor_channels.lightSensor]
      ) {
        if (
          this.this.board.mb.analogChannel[sensor_channels.lightSensor] >=
            this.threshold ||
          this.currentReading >= this.threshold
        ) {
          this.emit('change');
        }
        this.currentReading = this.board.mb.analogChannel[
          sensor_channels.lightSensor
        ];
      }
    });
    this.start();

    Object.defineProperties(this, {
      value: {
        get: function() {
          let ratio =
            this.board.mb.analogChannel[sensor_channels.lightSensor] / 255;
          return this.rangeMin + ratio * (this.rangeMax - this.rangeMin);
        }
      },
      threshold: {
        set: function(value) {
          this.threshold = value;
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

  setRange(min, max) {
    this.rangeMin = min;
    this.rangeMax = max;
  }
}
