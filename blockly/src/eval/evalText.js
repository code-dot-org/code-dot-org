var EvalObject = require('./evalObject');
var EvalString = require('./evalString');
var evalUtils = require('./evalUtils');

var EvalText = function (text, fontSize, color) {
  evalUtils.ensureType(text, "string");
  evalUtils.ensureType(fontSize, "number");
  evalUtils.ensureType(color, "string");

  EvalObject.apply(this);

  this.text_ = text;
  this.fontSize_ = fontSize;

  this.style_ = 'solid';
  this.color_ = color;

  this.element_ = null;
};
EvalText.inherits(EvalObject);
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

  EvalObject.prototype.draw.apply(this, arguments);
};
