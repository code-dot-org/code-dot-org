var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalCircle = function (width, height, style, color) {
  evalUtils.ensureNumber(width);
  evalUtils.ensureNumber(height);
  evalUtils.ensureString(style);
  evalUtils.ensureString(color);

  EvalImage.apply(this, [style, color]);

  this.width_ = width;
  this.height_ = height;

  this.element_ = null;
};
EvalCircle.inherits(EvalImage);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'ellipse');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', 0);
  this.element_.setAttribute('cy', 0);
  this.element_.setAttribute('rx', this.width_ / 2);
  this.element_.setAttribute('ry', this.height_ / 2);

  EvalImage.prototype.draw.apply(this, arguments);
};
