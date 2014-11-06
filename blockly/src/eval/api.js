var evalUtils = require('./evalUtils');
var EvalString = require('./evalString');
var EvalCircle = require('./evalCircle');
var EvalTriangle = require('./evalTriangle');
var EvalMulti = require('./evalMulti');
var EvalRect = require('./evalRect');
var EvalEllipse = require('./evalEllipse');
var EvalText = require('./evalText');
var EvalStar = require('./evalStar');

// todo (brent) - make use of blockId?

exports.display = function (object) {
  if (object === undefined) {
    object = new EvalString("");
  }
  if (!object.draw) {
    object = new EvalString(object.toString());
  }
  Eval.displayedObject = object;
};

exports.string = function (str, blockId) {
  return new EvalString(str);
};

exports.circle = function (size, style, color) {
  return new EvalCircle(size, style, color);
};

exports.triangle = function (size, style, color) {
  return new EvalTriangle(size, style, color);
};

exports.overlay = function (top, bottom) {
  return new EvalMulti(top, bottom);
};

exports.underlay = function (bottom, top) {
  return new EvalMulti(top, bottom);
};

exports.square = function (size, style, color) {
  return new EvalRect(size, size, style, color);
};

exports.rectangle = function (width, height, style, color) {
  return new EvalRect(width, height, style, color);
};

exports.ellipse = function (width, height, style, color) {
  return new EvalEllipse(width, height, style, color);
};

exports.text = function (text, fontSize, color) {
  return new EvalText(text, fontSize, color);
};

exports.star = function (radius, fontSize, color) {
  return new EvalStar(radius, fontSize, color);
};

exports.placeImage = function (x, y, image, blockId) {
  // todo - validate we have an image, use public setter
  // todo - where does argument validation happen?

  // User inputs why in cartesian space. Convert to pixel space before sending
  // to our EvalObject.
  y = evalUtils.cartesianToPixel(y);

  image.place(x, y);
  return image;
};

exports.rotateImage = function (degrees, image) {
  image.rotate(degrees);
  return image;
};

exports.scaleImage = function (factor, image) {
  image.scale(factor, factor);
  return image;
};

exports.stringAppend = function (first, second) {
  evalUtils.ensureType(first, EvalString);
  evalUtils.ensureType(second, EvalString);

  return new EvalString(first.getValue() + second.getValue());
};

// polling for values
exports.stringLength = function (str) {
  evalUtils.ensureType(str, EvalString);

  return str.getValue().length;
};
