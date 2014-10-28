var EvalObject = require('./evalObject');
var evalUtils = require('./evalUtils');

var EvalMulti = function (image1, image2) {
  evalUtils.ensureType(image1, EvalObject);
  evalUtils.ensureType(image2, EvalObject);

  EvalObject.apply(this);

  this.image1_ = image1;
  this.image2_ = image2;

  this.element_ = null;

  // default not to transform
  this.x_ = 0;
  this.y_ = 0;
};
EvalMulti.inherits(EvalObject);
module.exports = EvalMulti;

EvalMulti.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'g');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('transform', "translate(" + this.x_ + ", " + this.y_ + ")");
  this.image2_.draw(this.element_);
  this.image1_.draw(this.element_);
};
