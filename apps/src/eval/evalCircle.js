var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');
require('../utils'); // Provides Function.prototype.inherits

var EvalCircle = function (radius, style, color) {
  evalUtils.ensureNumber(radius);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.radius_ = radius;

  this.element_ = null;
};
EvalCircle.inherits(EvalImage);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'circle');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', 0);
  this.element_.setAttribute('cy', 0);
  this.element_.setAttribute('r', this.radius_);

  EvalImage.prototype.draw.apply(this, arguments);
};

EvalCircle.prototype.rotate = function () {
  // No-op. Rotating the circle svg gives us some problems when we convert to
  // a bitmap.
};
