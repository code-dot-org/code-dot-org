var evalUtils = require('./evalUtils');

var EvalObject = function () {
  // x/y location in pixel space
  this.x_ = 200;
  this.y_ = 200;
};
module.exports = EvalObject;

EvalObject.prototype.draw = function (parent) {
  if (this.style_ && this.color_) {
    this.element_.setAttribute('fill', evalUtils.getFill(this.style_, this.color_));
    this.element_.setAttribute('stroke', evalUtils.getStroke(this.style_, this.color_));
    this.element_.setAttribute('opacity', evalUtils.getOpacity(this.style_, this.color_));
  }
};
