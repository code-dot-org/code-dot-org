var EvalObject = require('./evalObject');
var EvalString = require('./evalString');

var EvalCircle = function (color, radius) {
  EvalObject.apply(this);

  this.radius_ = radius;
  // todo (brent) - where should validation of color happen?
  if (!(color instanceof EvalString)) {
    throw new Error("expected EvalString");
  }
  this.color_ = color.getValue();
  // default to be entirely on screen
  this.x_ = radius;
  this.y_ = radius;
  this.element_ = null;
};
EvalCircle.inherits(EvalObject);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'circle');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', this.x_);
  this.element_.setAttribute('cy', this.y_);
  this.element_.setAttribute('r', this.radius_);
  this.element_.setAttribute('fill', this.color_);
};
