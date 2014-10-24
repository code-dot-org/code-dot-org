var EvalObject = require('./evalObject');
var EvalString = require('./evalString');

// todo - should live elsewhere?
function getFill(style, color) {
  // todo - i18n
  // todo - 1asdf becomes 1 with parseInt
  // for now, we treat anything we don't recognize as solid.
  var alpha = parseInt(style, 10);
  if (style !== "outline") {
    return color;
  }
  return "none";
}

function getStroke(style, color) {
  if (style === "outline") {
    return color;
  }
  return "none";
}

function getOpacity(style, color) {
  // todo - validate alpha is in range 0 - 255?
  var alpha = parseInt(style, 10);
  if (alpha !== undefined) {
    return alpha / 255;
  }
  return 1.0;
}

// todo - stick in a utils file?
function ensureEvalString(val) {
  if (!(val instanceof EvalString)) {
    // todo - better strategy than throwing?
    throw new Error("expected EvalString");
  }
}


var EvalCircle = function (radius, style, color) {
  ensureEvalString(style);
  ensureEvalString(color);

  EvalObject.apply(this);

  this.radius_ = radius;
  this.color_ = color.getValue();
  this.style_ = style.getValue();

  // default to be entirely on screen
  this.x_ = radius;
  this.y_ = radius;

  this.element_ = null;
};
EvalCircle.inherits(EvalObject);
module.exports = EvalCircle;

EvalCircle.prototype.draw = function (parent) {
  if (!this.element_) {
    this.element_ = document.createElementNS(Blockly.SVG_NS, 'circle');
    parent.appendChild(this.element_);
  }
  this.element_.setAttribute('cx', this.x_);
  this.element_.setAttribute('cy', this.y_);
  this.element_.setAttribute('r', this.radius_);

  // todo - alpha
  this.element_.setAttribute('fill', getFill(this.style_, this.color_));
  this.element_.setAttribute('stroke', getStroke(this.style_, this.color_));
  this.element_.setAttribute('opacity', getOpacity(this.style_, this.color_));
};
