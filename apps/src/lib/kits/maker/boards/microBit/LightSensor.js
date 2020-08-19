import {EventEmitter} from 'events';
import {
  SENSOR_CHANNELS,
  roundToHundredth,
  SAMPLE_INTERVAL,
  MAX_SENSOR_BUFFER_LENGTH,
  MAX_LIGHT_SENSOR_VALUE
} from './MicroBitConstants';

export default class LightSensor extends EventEmitter {
  constructor(board) {
    super();
    this.state = {
      threshold: 128,
      rangeMin: 0,
      rangeMax: 255,
      currentReading: 0
    };
    // Track 3 seconds of historical data in a circular buffer over which
    // we can average sensor readings
    this.buffer = new Float32Array(MAX_SENSOR_BUFFER_LENGTH / SAMPLE_INTERVAL);
    this.currentBufferWriteIndex = 0;

    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      // Record current reading to keep finite historical buffer.
      this.buffer[this.currentBufferWriteIndex] = this.board.mb.analogChannel[
        SENSOR_CHANNELS.lightSensor
      ];
      this.currentBufferWriteIndex++;
      // Modulo the index to loop to the beginning of the buffer when it exceeds array size
      this.currentBufferWriteIndex =
        this.currentBufferWriteIndex % this.buffer.length;
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

  // Get the averaged value over the given ms, adjusted within the range, if specified
  // TODO: Handle if the range is outside of 50 (before first sample) or 3000 (longer than our buffer).
  // Currently returns null if range is outside of acceptable values
  getAveragedValue(ms) {
    if (ms >= SAMPLE_INTERVAL && ms <= MAX_SENSOR_BUFFER_LENGTH) {
      // Divide ms range by sample rate of sensor
      let indicesRange = Math.ceil(ms / SAMPLE_INTERVAL);
      let sum = 0;
      for (let i = 0; i < indicesRange; i++) {
        // currentBufferWriteIndex points to the next spot to write, so first historical
        // data value is at (currentBufferWriteIndex - 1)
        let index =
          (this.buffer.length + (this.currentBufferWriteIndex - (i + 1))) %
          this.buffer.length;
        sum += this.buffer[index];
      }
      return scaleWithinRange(
        sum / indicesRange,
        this.state.rangeMin,
        this.state.rangeMax
      );
    } else {
      return null;
    }
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
