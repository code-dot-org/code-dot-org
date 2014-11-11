var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalRect = function (width, height, style, color) {
  evalUtils.ensureNumber(width);
  evalUtils.ensureNumber(height);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.width_ = width;
  this.height_ = height;

  this.element_ = null;
};
EvalRect.inherits(EvalImage);
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

  EvalImage.prototype.draw.apply(this, arguments);
};
