var EvalObject = require('./evalObject');
var EvalString = require('./evalString');
var evalUtils = require('./evalUtils');

var EvalRect = function (width, height, style, color) {
  evalUtils.ensureType(width, "number");
  evalUtils.ensureType(height, "number");
  evalUtils.ensureType(style, "string");
  evalUtils.ensureType(color, "string");

  EvalObject.apply(this);

  this.width_ = width;
  this.height_ = height;
  this.color_ = color;
  this.style_ = style;

  this.element_ = null;
};
EvalRect.inherits(EvalObject);
module.exports = EvalRect;

EvalRect.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'rect');
    parent.appendChild(this.element_);
  }

  // center rect at 0, 0. we'll use transforms to move it.
  this.element_.setAttribute('x', -this.width_ / 2);
  this.element_.setAttribute('y', -this.height_ / 2);
  this.element_.setAttribute('width', this.width_);
  this.element_.setAttribute('height', this.height_);

  EvalObject.prototype.draw.apply(this, arguments);
};
