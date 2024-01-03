var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');
require('../utils'); // Provides Function.prototype.inherits

var EvalText = function (text, fontSize, color) {
  evalUtils.ensureString(text);
  evalUtils.ensureNumber(fontSize);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, ['solid', color]);

  this.text_ = text;
  this.fontSize_ = fontSize;

  this.element_ = null;
};
EvalText.inherits(EvalImage);
module.exports = EvalText;

EvalText.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'text');
    parent.appendChild(this.element_);
  }
  this.element_.textContent = this.text_;
  this.element_.setAttribute('style', 'font-size: ' + this.fontSize_ + 'pt');

  var bbox = this.element_.getBBox();
  // center at origin
  this.element_.setAttribute('x', -bbox.width / 2);
  this.element_.setAttribute('y', -bbox.height / 2);

  EvalImage.prototype.draw.apply(this, arguments);
};

EvalText.prototype.getText = function () {
  return this.text_;
};
