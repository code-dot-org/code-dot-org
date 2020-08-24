import {EventEmitter} from 'events';
import {
  SENSOR_CHANNELS,
  roundToHundredth,
  SAMPLE_INTERVAL,
  MAX_SENSOR_BUFFER_DURATION,
  MAX_LIGHT_SENSOR_VALUE
} from './MicroBitConstants';
import {apiValidateTypeAndRange} from '../../../../util/javascriptMode';

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
      currentBufferWriteIndex: 0
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

      this.state.currentReading = this.board.mb.analogChannel[
        SENSOR_CHANNELS.lightSensor
      ];
    });
    this.start();

    Object.defineProperties(this, {
      value: {
        get: function() {
          return scaleWithinRange(
            this.board.mb.analogChannel[SENSOR_CHANNELS.lightSensor],
            this.state.rangeMin,
            this.state.rangeMax
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
    this.board.mb.streamAnalogChannel(SENSOR_CHANNELS.lightSensor);
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(SENSOR_CHANNELS.lightSensor); // disable light sensor
  }

  // Reset the state to initial values between runs
  reset() {
    this.state = {
      threshold: 128,
      rangeMin: 0,
      rangeMax: MAX_LIGHT_SENSOR_VALUE,
      currentReading: 0,
      currentBufferWriteIndex: 0
    };
    if (this.state.buffer) {
      this.state.buffer.fill(0);
    }
  }

  // Get the averaged value over the given ms, adjusted within the range, if specified.
  // If ms is outside of 50 and 3000 range, prints a warning to debug console.
  getAveragedValue(ms) {
    let opts = {ms};
    apiValidateTypeAndRange(
      opts,
      'lightSensor.getAveragedValue',
      'ms',
      opts.ms,
      'number',
      SAMPLE_INTERVAL,
      MAX_SENSOR_BUFFER_DURATION
    );

    // Divide ms range by sample rate of sensor
    let requestedRange = Math.ceil(ms / SAMPLE_INTERVAL);
    let indicesRange;
    // User requested average over greater range than is recorded, so average over all
    // recorded data.
    if (requestedRange >= this.state.currentBufferWriteIndex) {
      indicesRange = this.state.currentBufferWriteIndex;
    } else {
      indicesRange = requestedRange;
    }

    let endIndex = this.state.currentBufferWriteIndex;
    let startIndex = endIndex - indicesRange;
    // (currentBufferWriteIndex % buffer.length) points to the next spot to write, so historical
    // data starts at ((currentBufferWriteIndex % buffer.length) - 1)
    let sum = 0;
    for (let index = startIndex; index < endIndex; index++) {
      // Because index might be negative, use modulo to loop circular buffer.
      let sumIndex =
        (index + this.state.buffer.length) % this.state.buffer.length;
      sum += this.state.buffer[sumIndex];
    }
    return scaleWithinRange(
      sum / indicesRange,
      this.state.rangeMin,
      this.state.rangeMax
    );
  }

  setRange(min, max) {
    this.state.rangeMin = min;
    this.state.rangeMax = max;
  }
}

// Students can specify a min and max range for the data to scale within.
// This function calculates where a reading from the sensor between 0 and 255
// falls within the min and max range.
function scaleWithinRange(value, min, max) {
  let ratio = value / MAX_LIGHT_SENSOR_VALUE;
  return roundToHundredth(min + ratio * (max - min));
}
