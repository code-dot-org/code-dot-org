var evalUtils = require('./evalUtils');

var EvalObject = function () {
  // x/y location in pixel space
  this.x_ = 200;
  this.y_ = 200;

  this.rotation_ = 0;
};
module.exports = EvalObject;

// todo (brent) arguably some of these things should be on an EvalImage instead of EvalObject
EvalObject.prototype.draw = function (parent) {
  if (this.style_ && this.color_) {
    this.element_.setAttribute('fill', evalUtils.getFill(this.style_, this.color_));
    this.element_.setAttribute('stroke', evalUtils.getStroke(this.style_, this.color_));
    this.element_.setAttribute('opacity', evalUtils.getOpacity(this.style_, this.color_));
  }

  var transform = "";
  if (this.rotation_ !== 0) {
    transform += " rotate(" + this.rotation_ + " " + this.x_ + " " + this.y_ + ")";
  }

  if (transform === "") {
    this.element_.removeAttribute("transform");
  } else {
    this.element_.setAttribute("transform", transform);
  }
};

EvalObject.prototype.place = function (x, y) {
  this.x_ = x;
  this.y_ = y;
};

EvalObject.prototype.rotate = function (degrees) {
  this.rotation_ = degrees;
};
