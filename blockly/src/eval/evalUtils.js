/**
 * Throws an expection if val is not of the expected type. Type is either a
 * string (like "number" or "string") or an object (Like EvalObject).
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
  // todo - 1asdf becomes 1 with parseInt. do we care?
  // for now, we treat anything we don't recognize as solid.
  var alpha = parseInt(style, 10);
  if (style !== "outline") {
    return color;
  }
  return "none";
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
module.exports.getOpacity = function (style, color) {
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
