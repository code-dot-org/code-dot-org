/** @file Wrapper around Johnny-Five NeoPixel component */
import five from '@code-dot-org/johnny-five';

/**
 * Properties of the wrapped five.Led.RGB that the NeoPixel exposes as its own.
 * @type {string[]}
 */
export const PASS_THRU_PROPERTIES = [
  'board',
  'pin',
];

/**
 * Methods of the wrapped five.Led.RGB that the NeoPixel exposes unmodified.
 * @type {string[]}
 */
export const PASS_THRU_METHODS = [
  'blink',
  'color',
  'intensity',
  'stop',
  'toggle',
];

/**
 * Wrap Johnny-Five's Led.RGB (neopixel) component to modify the behavior of
 * its on() and off() functions.
 * @param args - see five.Led.RGB
 * @constructor
 */
export default function NeoPixel(...args) {
  /** @private {five.Led.RGB} */
  this.rgb_ = new five.Led.RGB(...args);

  // Set of properties that simply pass-through to wrapped Led controller.
  PASS_THRU_PROPERTIES.forEach(prop => Object.defineProperty(this, prop, {
    get: () => this.rgb_[prop],
    set: val => this.rgb_[prop] = val,
  }));
}

// Set of functions that simply pass-through to the wrapped Led controller.
PASS_THRU_METHODS.forEach(fnName => {
  NeoPixel.prototype[fnName] = function (...args) {
    return this.rgb_[fnName](...args);
  };
});

/**
 * The on() function should call stop() to cancel any LED animation (blinking,
 * etc) before turning the LED on.
 */
NeoPixel.prototype.on = function (...args) {
  this.rgb_.stop();
  return this.rgb_.on(...args);
};

/**
 * The off() function should call stop() to cancel any LED animation (blinking,
 * etc.) before turning the LED off.
 */
NeoPixel.prototype.off = function (...args) {
  this.rgb_.stop();
  return this.rgb_.off(...args);
};
