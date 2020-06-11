import {EventEmitter} from 'events';
import {sensor_channels, roundToHundredth} from './MicroBitConstants';

export default class LightSensor extends EventEmitter {
  constructor(board) {
    super();
    this.state = {
      threshold: 128,
      rangeMin: 0,
      rangeMax: 255,
      currentReading: 0
    };
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      // Only emit the data event when the value is above the threshold or the
      // previous reading was above the threshold
      if (
        this.board.mb.analogChannel[sensor_channels.lightSensor] >=
          this.state.threshold ||
        this.state.currentReading >= this.state.threshold
      ) {
        this.emit('data');

        // If the light value has changed, trigger a change event
        if (
          this.state.currentReading !==
          this.board.mb.analogChannel[sensor_channels.lightSensor]
        ) {
          this.emit('change');
        }
      }

      this.state.currentReading = this.board.mb.analogChannel[
        sensor_channels.lightSensor
      ];
    });
    this.start();

    Object.defineProperties(this, {
      value: {
        get: function() {
          let ratio =
            this.board.mb.analogChannel[sensor_channels.lightSensor] / 255;
          return roundToHundredth(
            this.state.rangeMin +
              ratio * (this.state.rangeMax - this.state.rangeMin)
          );
        }
      },
      threshold: {
        set: function(value) {
          this.state.threshold = value;
        },
        get: function(value) {
          return this.state.threshold;
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
    this.state.rangeMin = min;
    this.state.rangeMax = max;
  }
}
