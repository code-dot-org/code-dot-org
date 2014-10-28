var EvalObject = require('./evalObject');
var EvalString = require('./evalString');
var evalUtils = require('./evalUtils');

var EvalTriangle = function (edge, style, color) {
  evalUtils.ensureType(style, EvalString);
  evalUtils.ensureType(color, EvalString);

  EvalObject.apply(this);

  this.edge_ = edge;
  this.color_ = color.getValue();
  this.style_ = style.getValue();

  this.element_ = null;
};
EvalTriangle.inherits(EvalObject);
module.exports = EvalTriangle;

EvalTriangle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'path');
    parent.appendChild(this.element_);
  }

  // x/y refer to center of triangle
  var height = Math.sqrt(3) / 2 * this.edge_;

  var bottomLeft = {
    x: this.x_ - this.edge_ / 2,
    y: this.y_ + height / 2
  };

  var bottomRight = {
    x: this.x_ + this.edge_ / 2,
    y: this.y_ + height / 2
  };

  var top = {
    x: this.x_,
    y: this.y_ - height / 2
  };


  var path = "M " + bottomLeft.x + " " + bottomLeft.y +
    " L " + bottomRight.x + " " + bottomRight.y +
    " L " + top.x + " " + top.y + " z";

  this.element_.setAttribute("d", path)

  this.element_.setAttribute('fill', evalUtils.getFill(this.style_, this.color_));
  this.element_.setAttribute('stroke', evalUtils.getStroke(this.style_, this.color_));
  this.element_.setAttribute('opacity', evalUtils.getOpacity(this.style_, this.color_));
};
