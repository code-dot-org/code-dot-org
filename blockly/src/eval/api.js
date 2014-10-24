var EvalString = require('./evalString');
var EvalCircle = require('./evalCircle');

// todo (brent) - make use of blockId

exports.register = function (object) {

  // todo (brent) - hacky way to get last expression
  Eval.lastEvalObject = object;

  return object;
};

exports.string = function (str, blockId) {
  return exports.register(new EvalString(str));
};

exports.circle = function (color, size, blockId) {
  return exports.register(new EvalCircle(color, size));
};

exports.placeImage = function (image, x, y, blockId) {
  // todo - validate we have an image, use public setter
  image.x_ = x;
  image.y_ = y;
  return exports.register(image);
};
