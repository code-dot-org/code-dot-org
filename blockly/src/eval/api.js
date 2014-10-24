var EvalString = require('./evalString');
var EvalCircle = require('./evalCircle');
var EvalMulti = require('./evalMulti');

// todo (brent) - make use of blockId

exports.register = function (object) {

  // todo (brent) - hacky way to get last object
  Eval.lastEvalObject = object;

  return object;
};

exports.string = function (str, blockId) {
  console.log("register string");
  return exports.register(new EvalString(str));
};

exports.circle = function (size, style, color) {
  console.log("register circle");
  return exports.register(new EvalCircle(size, style, color));
};

exports.placeImage = function (image, x, y, blockId) {
  console.log("register place");
  // todo - validate we have an image, use public setter
  // todo - where does argument validation happen?
  image.x_ = x;
  image.y_ = y;
  return exports.register(image);
};

exports.overlay = function (image1, image2) {
  console.log("register overlay");
  return exports.register(new EvalMulti(image1, image2));
};
