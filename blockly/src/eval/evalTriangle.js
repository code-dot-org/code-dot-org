var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');

var EvalTriangle = function (edge, style, color) {
  evalUtils.ensureType(edge, "number");
  evalUtils.ensureType(style, "string");
  evalUtils.ensureType(color, "string");

  EvalImage.apply(this, [style, color]);

  this.edge_ = edge;

  this.element_ = null;
};
EvalTriangle.inherits(EvalImage);
module.exports = EvalTriangle;

EvalTriangle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
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

  this.element_.setAttribute('points',
    bottomLeft.x +',' + bottomLeft.y + ' ' +
    bottomRight.x + ',' + bottomRight.y + ' ' +
    top.x + ',' + top.y);

  EvalImage.prototype.draw.apply(this, arguments);
};
