/**
 * @overview UI slider used to control router memory size.
 */
import '../utils'; // Provides Function.prototype.inherits

import NetSimConstants from './NetSimConstants';
import NetSimUtils from './NetSimUtils';
import NetSimSlider from './NetSimSlider';

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {function} sliderChangeCallback
 * @param {function} sliderStopCallback
 * @constructor
 */
var NetSimMemoryControl = function (
  rootDiv,
  sliderChangeCallback,
  sliderStopCallback
) {
  NetSimSlider.LogarithmicSlider.call(this, rootDiv, {
    onChange: sliderChangeCallback,
    onStop: sliderStopCallback,
    value: Infinity,
    min: NetSimConstants.BITS_PER_BYTE,
    max: NetSimConstants.BITS_PER_MEGABYTE,
    upperBoundInfinite: true,
  });

  // Auto-render, unlike our base class
  this.render();
};
export default NetSimMemoryControl;
NetSimMemoryControl.inherits(NetSimSlider.LogarithmicSlider);

/**
 * Converts a numeric memory value (in bits) into a compact localized string
 * representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimMemoryControl.prototype.valueToLabel = function (val) {
  return NetSimUtils.bitsToLocalizedRoundedBytesize(val);
};
