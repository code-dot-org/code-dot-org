module.exports.ensureType = function (val, type) {
  if (!(val instanceof type)) {
    // todo - better strategy than throwing?
    throw new Error("unexpected object");
  }
}

module.exports.getFill = function (style, color) {
  // todo - i18n
  // todo - 1asdf becomes 1 with parseInt
  // for now, we treat anything we don't recognize as solid.
  var alpha = parseInt(style, 10);
  if (style !== "outline") {
    return color;
  }
  return "none";
}

module.exports.getStroke = function (style, color) {
  if (style === "outline") {
    return color;
  }
  return "none";
}

module.exports.getOpacity = function (style, color) {
  // todo - validate alpha is in range 0 - 255?
  var alpha = parseInt(style, 10);
  if (alpha !== undefined) {
    return alpha / 255;
  }
  return 1.0;
}
