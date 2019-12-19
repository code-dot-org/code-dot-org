/** @file wrap Playground.Thermometer to expose raw value */
import Playground from 'playground-io';
import {EventEmitter} from 'events';

// All we care about doing here is caching the temp sensor's raw input value
// and then exposing it as a property on the Thermometer object.
// Otherwise we're going to pass everything through to the playground-io controller.

let thermometerRawValue;
const PlaygroundThermometer = {
  initialize: {
    value: function() {
      Playground.Thermometer.initialize.value.apply(this, arguments);
      const rawValueDescriptor = {
        enumerable: true,
        get: function() {
          return thermometerRawValue;
        }
      };
      if (!this.hasOwnProperty('raw')) {
        Object.defineProperty(this, 'raw', rawValueDescriptor);
      }
      if (!this.hasOwnProperty('value')) {
        Object.defineProperty(this, 'value', rawValueDescriptor);
      }
    }
  },
  toCelsius: {
    value: function(raw) {
      thermometerRawValue = raw;
      return Playground.Thermometer.toCelsius.value(raw);
    }
  }
};
export default PlaygroundThermometer;

export class MicroBitThermometer extends EventEmitter {
  constructor(board) {
    super();
    this.currentTemp = 0;
    this.board = board;
    this.board.mb.addFirmataUpdateListener(() => {
      this.emit('data');

      // If the temp value has changed, update the local value and
      // trigger a change event
      if (this.currentTemp !== this.board.mb.analogChannel[12]) {
        this.currentTemp = this.board.mb.analogChannel[12];
        this.emit('change');
      }
    });
    this.start();

    Object.defineProperties(this, {
      raw: {
        get: function() {
          return this.board.mb.analogChannel[12];
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
          return Math.floor(rawValue * 100) / 100;
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
    this.board.mb.streamAnalogChannel(12); // enable temp sensor
  }

  stop() {
    this.board.mb.stopStreamingAnalogChannel(12); // disable temp sensor
  }
}
