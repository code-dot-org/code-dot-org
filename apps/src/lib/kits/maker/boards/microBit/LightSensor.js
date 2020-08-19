import {EventEmitter} from 'events';
import {
  SENSOR_CHANNELS,
  roundToHundredth,
  SAMPLE_INTERVAL,
  MAX_SENSOR_BUFFER_LENGTH
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
    // Track 3 seconds of historical data over which we can average sensor readings
    this.buffer = new Float32Array(MAX_SENSOR_BUFFER_LENGTH / SAMPLE_INTERVAL);
    this.bufferIndex = 0;

    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      // Record current reading to keep finite historical buffer.
      this.buffer[this.bufferIndex] = this.board.mb.analogChannel[
        SENSOR_CHANNELS.lightSensor
      ];
      this.bufferIndex++;
      // Modulo the index to loop to the beginning of the buffer when it exceeds array size
      this.bufferIndex = this.bufferIndex % this.buffer.length;
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
          return calculateValueWithinRange(
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

  // Get the averaged value over the give range of ms, adjusted within specified range
  // TODO: Handle if the range is outside of 50 (before first sample) or 3000 (longer than our buffer).
  // Currently returns null if range is outside of acceptable values
  getAveragedValue(range) {
    if (range >= SAMPLE_INTERVAL && range <= MAX_SENSOR_BUFFER_LENGTH) {
      // Divide ms range by sample rate of sensor
      let indicesRange = Math.ceil(range / SAMPLE_INTERVAL);
      let sum = 0;
      for (let i = 0; i < indicesRange; i++) {
        // bufferIndex points to the next spot to write, so first historical
        // data value is at (bufferIndex - 1)
        let index =
          (this.buffer.length + (this.bufferIndex - (i + 1))) %
          this.buffer.length;
        sum += this.buffer[index];
      }
      return calculateValueWithinRange(
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

function calculateValueWithinRange(value, min, max) {
  let ratio = value / 255;
  return roundToHundredth(min + ratio * (max - min));
}
