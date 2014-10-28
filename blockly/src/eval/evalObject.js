var EvalObject = function () {
  // x/y location in pixel space
  this.x_ = 200;
  this.y_ = 200;
};
module.exports = EvalObject;

EvalObject.prototype.draw = function (parent) {
  throw "Overriden by descendants";
};
