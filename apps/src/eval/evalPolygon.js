var EvalImage = require('./evalImage');
var evalUtils = require('./evalUtils');
require('../utils'); // Provides Function.prototype.inherits

var EvalPolygon = function (sideCount, length, style, color) {
  evalUtils.ensureNumber(sideCount);
  evalUtils.ensureNumber(length);
  evalUtils.ensureStyle(style);
  evalUtils.ensureColor(color);

  EvalImage.apply(this, [style, color]);

  this.radius_ = length / (2 * Math.sin(Math.PI / sideCount));
  this.pointCount_ = sideCount;

  this.element_ = null;
};
EvalPolygon.inherits(EvalImage);
module.exports = EvalPolygon;

EvalPolygon.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'polygon');
    parent.appendChild(this.element_);
  }

  var points = [];
  var radius = this.radius_;

  var angle = 2 * Math.PI / this.pointCount_;
  for (var i = 1; i <= this.pointCount_; i++) {
    points.push(radius * Math.cos(i * angle) + "," + radius * Math.sin(i * angle));
  }

  this.element_.setAttribute('points', points.join(' '));

  EvalImage.prototype.draw.apply(this, arguments);
};
