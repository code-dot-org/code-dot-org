var EvalObject = require('./evalObject');
var evalUtils = require('./evalUtils');

var EvalMulti = function (image1, image2) {
  evalUtils.ensureType(image1, EvalObject);
  evalUtils.ensureType(image2, EvalObject);

  EvalObject.apply(this);

  this.image1_ = image1;
  this.image2_ = image2;

  // we want an object centered at 0, 0 that we can then apply transforms to.
  // to accomplish this, we need to adjust the children's x/y's to be relative
  // to us
  var deltaX, deltaY;
  deltaX = this.x_ - this.image1_.x_;
  deltaY = this.y_ - this.image1_.y_;
  this.image1_.updatePosition(deltaX, deltaY);
  deltaX = this.x_ - this.image2_.x_;
  deltaY = this.y_ - this.image2_.y_;
  this.image2_.updatePosition(deltaX, deltaY);

  this.element_ = null;
};
EvalMulti.inherits(EvalObject);
module.exports = EvalMulti;

EvalMulti.prototype.draw = function (parent) {
  if (!this.element_) {
    var deltaX, deltaY;

    this.element_ = document.createElementNS(Blockly.SVG_NS, 'g');
    parent.appendChild(this.element_);
  }

  this.image2_.draw(this.element_);
  this.image1_.draw(this.element_);

  EvalObject.prototype.draw.apply(this, arguments);
};
