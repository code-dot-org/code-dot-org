var EvalObject = require('./evalObject');
var EvalString = require('./evalString');
var evalUtils = require('./evalUtils');

var EvalStringImage = function (text, fontSize, color) {
  evalUtils.ensureType(text, EvalString);
  evalUtils.ensureType(color, EvalString);

  EvalObject.apply(this);

  this.text_ = text.getValue();
  this.fontSize_ = fontSize;

  this.color_ = color.getValue();

  this.element_ = null;
};
EvalStringImage.inherits(EvalObject);
module.exports = EvalStringImage;

EvalStringImage.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'text');
    parent.appendChild(this.element_);
  }
  this.element_.textContent = this.text_;
  this.element_.setAttribute('style', 'font-size: ' + this.fontSize_ + 'pt');

  EvalObject.prototype.draw.apply(this, arguments);
};
