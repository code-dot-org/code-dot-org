/** @file Wrapper around Johnny-Five Led component */
import five from '@code-dot-org/johnny-five';

/**
 * Properties of the wrapped five.Led that the Led exposes as its own.
 * @type {string[]}
 */
export const PASS_THRU_PROPERTIES = [
  'board',
  'pin',
];

/**
 * Methods of the wrapped five.Led that the Led exposes unmodified.
 * @type {string[]}
 */
export const PASS_THRU_METHODS = [
  'blink',
  'intensity',
  'stop',
  'toggle',
  'pulse',
];

/**
 * Wrap Johnny-Five's Led.RGB component to modify the behavior of its on() and
 * off() functions.
 * @param args - see five.Led
 * @constructor
 */
export default function Led(...args) {
  /** @private {five.Led} */
  this.led_ = new five.Led(...args);

  // Set of properties that simply pass-through to wrapped Led controller.
  PASS_THRU_PROPERTIES.forEach(prop => Object.defineProperty(this, prop, {
    get: () => this.led_[prop],
    set: val => this.led_[prop] = val,
  }));
}

// Set of functions that simply pass-through to the wrapped Led controller.
PASS_THRU_METHODS.forEach(fnName => {
  Led.prototype[fnName] = function (...args) {
    return this.led_[fnName](...args);
  };
});

/**
 * The on() function should call stop() to cancel any LED animation (blinking,
 * etc) before turning the LED on.
 */
Led.prototype.on = function (...args) {
  this.led_.stop();
  return this.led_.on(...args);
};

/**
 * The off() function should call stop() to cancel any LED animation (blinking,
 * etc.) before turning the LED off.
 */
Led.prototype.off = function (...args) {
  this.led_.stop();
  return this.led_.off(...args);
};
