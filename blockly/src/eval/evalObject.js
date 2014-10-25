var EvalObject = function () {
  this.x_ = 0;
  this.y_ = 0;
};
module.exports = EvalObject;

EvalObject.prototype.draw = function (parent) {
  throw "Overriden by descendants";
};
