var CustomEvalError = require('./evalError');
var _ = require('../lodash');

/**
 * Throws an expection if val is not of the expected type. Type is either a
 * string (like "number" or "string") or an object (Like EvalImage).
 */
module.exports.ensureString = function (val) {
  return module.exports.ensureType(val, "string");
};

module.exports.ensureNumber = function (val) {
  return module.exports.ensureType(val, "number");
};

/**
 * Style is either "solid", "outline", or a percentage i.e. "70%"
 */
module.exports.ensureStyle = function (val) {
  if (val.slice(-1) === '%') {
    var opacity = module.exports.getOpacity(val);
    if (opacity >= 0 && opacity <= 1.0) {
      return;
    }
  } if (_.contains(['outline', 'solid'], val)) {
    return;
  }
  throw new CustomEvalError(CustomEvalError.Type.BadStyle, val);
};

/**
 * Checks to see if this is a valid color, throwing if it isnt. Color validity
 * is determined by setting the value on an html element and seeing if it takes.
 */
module.exports.ensureColor = function (val) {
  var e = document.createElement('div');
  e.style.color = val;
  // We can't check that e.style.color === val, since some vals will be
  // transformed (i.e. #fff -> rgb(255, 255, 255)
  if (!e.style.color) {
    throw new CustomEvalError(CustomEvalError.Type.BadColor, val);
  }
};

/**
 * @param val
 * @param {string|Class} type
 */
module.exports.ensureType = function (val, type) {
  if (typeof(type) === "string") {
    if (typeof(val) !== type) {
      throw new Error("expected type: " + type + "\ngot type: " + typeof(val));
    }
  } else if (!(val instanceof type)) {
    throw new Error("unexpected object");
  }
};

module.exports.getFill = function (style, color) {
  if (style === 'outline') {
    return "none";
  }
  // for now, we treat anything we don't recognize as solid.
  return color;
};

module.exports.getStroke = function (style, color) {
  if (style === "outline") {
    return color;
  }
  return "none";
};

/**
 * Get the opacity from the style. Style is a string that is either a word or
 * percentage (i.e. 25%).
 */
module.exports.getOpacity = function (style) {
  var alpha = 1.0;
  if (style.slice(-1) === "%") {
    alpha = parseInt(style.slice(0, -1), 10) / 100;
  }
  return alpha;
};

/**
 * Users specify pixels in a coordinate system where the origin is at the bottom
 * left, and x and y increase as you move right/up. I'm referring to this as
 * the cartesian coordinate system.
 * The pixel coordinate system instead has origin at the top left, and x and y
 * increase as you move right/down.
 */
module.exports.cartesianToPixel = function (cartesianY) {
  return 400 - cartesianY;
};
