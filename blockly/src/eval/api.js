var EvalString = require('./evalString');
var EvalCircle = require('./evalCircle');
var EvalTriangle = require('./evalTriangle');
var EvalMulti = require('./evalMulti');
var EvalRect = require('./evalRect');

// todo (brent) - make use of blockId?

exports.register = function (object) {

  // todo (brent) - hacky way to get last object
  Eval.lastEvalObject = object;

  return object;
};

exports.string = function (str, blockId) {
  return exports.register(new EvalString(str));
};

exports.circle = function (size, style, color) {
  return exports.register(new EvalCircle(size, style, color));
};

exports.triangle = function (size, style, color) {
  return exports.register(new EvalTriangle(size, style, color));
};

exports.placeImage = function (image, x, y, blockId) {
  // todo - validate we have an image, use public setter
  // todo - where does argument validation happen?
  image.x_ = x;
  image.y_ = y;
  return exports.register(image);
};

exports.overlay = function (image1, image2) {
  return exports.register(new EvalMulti(image1, image2));
};

exports.square = function (size, style, color) {
  return exports.register(new EvalRect(size, size, style, color));
};

exports.rectangle = function (width, height, style, color) {
  return exports.register(new EvalRect(width, height, style, color));
};
