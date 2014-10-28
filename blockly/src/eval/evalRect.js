var EvalObject = require('./evalObject');
var EvalString = require('./evalString');
var evalUtils = require('./evalUtils');

var EvalRect = function (width, height, style, color) {
  evalUtils.ensureType(style, EvalString);
  evalUtils.ensureType(color, EvalString);

  EvalObject.apply(this);

  this.width_ = width;
  this.height_ = height;
  this.color_ = color.getValue();
  this.style_ = style.getValue();

  this.element_ = null;
};
EvalRect.inherits(EvalObject);
module.exports = EvalRect;

EvalRect.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'rect');
    parent.appendChild(this.element_);
  }

  // x/y refer to center of rect
  this.element_.setAttribute('x', this.x_ - this.width_ / 2);
  this.element_.setAttribute('y', this.y_ - this.height_ / 2);
  this.element_.setAttribute('width', this.width_);
  this.element_.setAttribute('height', this.height_);

  // todo (brent) - move this into parent?
  this.element_.setAttribute('fill', evalUtils.getFill(this.style_, this.color_));
  this.element_.setAttribute('stroke', evalUtils.getStroke(this.style_, this.color_));
  this.element_.setAttribute('opacity', evalUtils.getOpacity(this.style_, this.color_));
};
