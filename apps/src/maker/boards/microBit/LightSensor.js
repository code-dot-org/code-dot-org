import {EventEmitter} from 'events';

import {
  SENSOR_CHANNELS,
  SAMPLE_INTERVAL,
  MAX_SENSOR_BUFFER_DURATION,
  MAX_LIGHT_SENSOR_VALUE,
} from './MicroBitConstants';

export default class LightSensor extends EventEmitter {
  constructor(board) {
    super();
    this.state = {
      threshold: 128,
      rangeMin: 0,
      rangeMax: MAX_LIGHT_SENSOR_VALUE,
      currentReading: 0,
      // Track 3 seconds of historical data in a circular buffer over which
      // we can average sensor readings
      buffer: new Float32Array(MAX_SENSOR_BUFFER_DURATION / SAMPLE_INTERVAL),
      currentBufferWriteIndex: 0,
    };

    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      // Record current reading to keep finite historical buffer.
      // Modulo the index to loop to the beginning of the buffer when it exceeds array size.
      this.state.buffer[
        this.state.currentBufferWriteIndex % this.state.buffer.length
      ] = this.board.mb.analogChannel[SENSOR_CHANNELS.lightSensor];
      this.state.currentBufferWriteIndex++;
      // Only emit the data event when the value is above the threshold or the
      // previous reading was above the threshold
      if (
        this.board.mb.analogChannel[SENSOR_CHANNELS.lightSensor] >=
          this.state.threshold ||
        this.state.currentReading >= this.state.threshold
      ) {
        this.emit('data');

        // If the light value has changed, trigger a change event
        if (
          this.state.currentReading !==
          this.board.mb.analogChannel[SENSOR_CHANNELS.lightSensor]
        ) {
          this.emit('change');
        }
      }

      this.state.currentReading =
        this.board.mb.analogChannel[SENSOR_CHANNELS.lightSensor];
    });
    this.start();

    Object.defineProperties(this, {
      value: {
        get: function () {
          return scaleWithinRange(
            this.board.mb.analogChannel[SENSOR_CHANNELS.lightSensor],
            this.state.rangeMin,
            this.state.rangeMax
          );
        },
      },
      threshold: {
        set: function (value) {
          this.state.threshold = value;
        },
        get: function (value) {
          return this.state.threshold;
        },
      },
    });
  }

  start() {
    this.board.mb.enableLightSensor(); // enable light sensor
    this.board.mb.streamAnalogChannel(SENSOR_CHANNELS.lightSensor);
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(SENSOR_CHANNELS.lightSensor); // disable light sensor
  }

  // Reset the state to initial values between runs
  reset() {
    this.state.threshold = 128;
    this.state.rangeMin = 0;
    this.state.rangeMax = MAX_LIGHT_SENSOR_VALUE;
    this.state.currentReading = 0;
    this.state.currentBufferWriteIndex = 0;
    if (this.state.buffer) {
      this.state.buffer.fill(0);
    }
  }

  setScale(min, max) {
    this.state.rangeMin = min;
    this.state.rangeMax = max;
  }
}

// Students can specify a min and max range for the data to scale within.
// This function calculates where a reading from the sensor between 0 and 255
// falls within the min and max range.
function scaleWithinRange(value, min, max) {
  let ratio = value / MAX_LIGHT_SENSOR_VALUE;
  return Math.round(min + ratio * (max - min));
}
