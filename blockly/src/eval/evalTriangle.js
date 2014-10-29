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

  // center at 0, 0 (allowing transforms to move it around)
  // the center is halfway between width, and a third of the way up the height
  var height = Math.sqrt(3) / 2 * this.edge_;

  var bottomLeft = {
    x: -this.edge_ / 2,
    y: height / 3
  };

  var bottomRight = {
    x: this.edge_ / 2,
    y: height / 3
  };

  var top = {
    x: 0,
    y: -height * 2 / 3
  };


  var path = "M " + bottomLeft.x + " " + bottomLeft.y +
    " L " + bottomRight.x + " " + bottomRight.y +
    " L " + top.x + " " + top.y + " z";

  this.element_.setAttribute("d", path)

  EvalObject.prototype.draw.apply(this, arguments);
};
