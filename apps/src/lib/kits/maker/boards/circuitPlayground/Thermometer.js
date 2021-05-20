/** @file wrap Playground.Thermometer to expose raw value */
import Playground from 'playground-io';

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
