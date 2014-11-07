var EvalObject = require('./evalObject');
var EvalString = require('./evalString');
var evalUtils = require('./evalUtils');

var EvalCircle = function (radius, style, color) {
  evalUtils.ensureType(radius, "number");
  evalUtils.ensureType(style, "string");
  evalUtils.ensureType(color, "string");

  EvalObject.apply(this);

  this.radius_ = radius;

  // todo - send color/style along to EvalObject ctor
  this.color_ = color;
  this.style_ = style;

  this.element_ = null;
};
EvalCircle.inherits(EvalObject);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'circle');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', 0);
  this.element_.setAttribute('cy', 0);
  this.element_.setAttribute('r', this.radius_);

  EvalObject.prototype.draw.apply(this, arguments);
};

EvalCircle.prototype.rotate = function () {
  // No-op. Rotating the circle svg gives us some problems when we convert to
  // a bitmap.
};
