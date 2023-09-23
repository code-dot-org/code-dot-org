/**
 * @overview UI slider for changing the pulse rate (bitrate) of the local device.
 *           Differs from the bitrate slider in its scale and units.
 * @see NetSimBitRateControl
 */

// Utils required only for Function.prototype.inherits()
import '../utils';

import i18n from '@cdo/netsim/locale';
import NetSimSlider from './NetSimSlider';

/**
 * Generator and controller for packet size slider/selector
 * @param {jQuery} rootDiv
 * @param {number} initialValue - in seconds per pulse
 * @param {function} sliderChangeCallback
 * @constructor
 */
var NetSimPulseRateControl = function (
  rootDiv,
  initialValue,
  sliderChangeCallback
) {
  NetSimSlider.DecimalPrecisionSlider.call(this, rootDiv, {
    onChange: sliderChangeCallback,
    value: initialValue,
    min: 0.5,
    max: 5.0,
    step: -0.25,
  });

  // Auto-render, unlike our base class
  this.render();
};
export default NetSimPulseRateControl;
NetSimPulseRateControl.inherits(NetSimSlider.DecimalPrecisionSlider);

/**
 * Converts a numeric rate value (in seconds per pulse) into a
 * localized string representation of that value.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimPulseRateControl.prototype.valueToLabel = function (val) {
  var rounded = Math.floor(val * 100) / 100;
  if (rounded === 1) {
    return i18n.xSecondPerPulse({x: rounded});
  }
  return i18n.xSecondsPerPulse({x: rounded});
};

/**
 * Converts a numeric rate value (in seconds per pulse) into a compact
 * localized string representation of that value, used for ends of the slider.
 * @param {number} val - numeric value of the control
 * @returns {string} - localized string representation of value
 * @override
 */
NetSimPulseRateControl.prototype.valueToShortLabel = function (val) {
  return val;
};
