module.exports.ensureType = function (val, type) {
  if (!(val instanceof type)) {
    // todo - better strategy than throwing?
    throw new Error("unexpected object");
  }
};

module.exports.getFill = function (style, color) {
  // todo - i18n
  // todo - 1asdf becomes 1 with parseInt
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
