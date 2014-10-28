var EvalObject = require('./evalObject');

var EvalString = function (val) {
  EvalObject.apply(this);

  this.val_ = val;
  this.element_ = null;
};
EvalString.inherits(EvalObject);
module.exports = EvalString;

EvalString.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'text');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('x', this.x_);
  this.element_.setAttribute('y', this.y_);
  this.element_.textContent = this.val_;
  var bbox = this.element_.getBBox();
  // have y coordinate refer to top instead of bottom
  this.element_.setAttribute('y', this.y_ + bbox.height);
};

// todo - brent - is there a function that can be shared across all EvalObjects?
EvalString.prototype.getValue = function () {
  return this.val_;
};
