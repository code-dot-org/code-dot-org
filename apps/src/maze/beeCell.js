/**
 * @overview BeeCell represents the contets of the grid elements for Bee.
 * Bee BeeCells are more complex than many other kinds of cell; they can be
 * "hidden" with clouds, they can represent multiple different kinds of
 * element (flower, hive), some of which can be multiple colors (red,
 * purple), and which can have a range of possible values.
 *
 * Some cells can also be "variable", meaning that their contents are
 * not static but can in fact be randomized between runs.
 */

// FC is short for FlowerComb, which we were originally using instead of cloud
var CLOUD = {
  STATIC: 'FC',
  VARIABLE: 'C',
  ANY: 'Cany',
  NONE: undefined
};
var FLOWER = {
  RED: 'R',
  PURPLE: 'P'
};
var PREFIX = {
  FLOWER: '+',
  HIVE: '-'
};

var BeeCell = function (value, clouded, prefix, color, range) {
  /**
   * @type {String}
   */
  this.clouded_ = clouded;

  /**
   * @type {String}
   */
  this.prefix_ = prefix;

  /**
   * @type {String}
   */
  this.color_ = color;

  /**
   * @type {Number}
   */
  this.range_ = range || value;

  /**
   * @type {Number}
   */
  this.originalValue_ = value;

  /**
   * @type {Number}
   */
  this.currentValue_ = undefined;
  this.resetCurrentValue();

  if (this.isVariableRange() && this.isVariableCloud()) {
    // We don't support both of these. Throw an error or something.
    console.warn("Cells cannot have both variable ranges and variable clouds");
    this.range_ = this.originalValue_;
  }
};

module.exports = BeeCell;

/**
 * Returns a new BeeCell that's an exact replica of this one
 * @return {BeeCell}
 */
BeeCell.prototype.clone = function () {
  var newBeeCell = new BeeCell(this.originalValue_, this.clouded_, this.prefix_, this.color_);
  newBeeCell.setCurrentValue(this.currentValue_);
  return newBeeCell;
};

/**
 * @return {Number}
 */
BeeCell.prototype.getCurrentValue = function () {
  return this.currentValue_;
};

/**
 * @param {Number}
 */
BeeCell.prototype.setCurrentValue = function (val) {
  this.currentValue_ = val;
};

BeeCell.prototype.resetCurrentValue = function () {
  if (this.prefix_) {
    this.currentValue_ = parseInt(this.prefix_ + this.originalValue_);
  } else {
    this.currentValue_ = 0;
  }
};

BeeCell.prototype.isFlower = function () {
  return this.prefix_ === PREFIX.FLOWER;
};

BeeCell.prototype.isHive = function () {
  return this.prefix_ === PREFIX.HIVE;
};

/**
 * Flowers can be red, purple, or undefined.
 * @return {boolean}
 */
BeeCell.prototype.isRedFlower = function () {
  return this.isFlower() && this.color_ === FLOWER.RED;
};

/**
 * Flowers can be red, purple, or undefined.
 * @return {boolean}
 */
BeeCell.prototype.isPurpleFlower = function () {
  return this.isFlower() && this.color_ === FLOWER.PURPLE;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isStaticCloud = function () {
  return this.clouded_ === CLOUD.STATIC;
};

/**
 * @return {boolean}
 */
BeeCell.prototype.isVariableCloud = function () {
  return (this.clouded_ === CLOUD.VARIABLE || this.clouded_ === CLOUD.ANY);
};

BeeCell.prototype.isVariableRange = function () {
  return this.range_ && this.range_ > this.originalValue_;
};

/**
 * Variable cells can represent multiple possible kinds of grid assets,
 * whereas non-variable cells can represent only a single kind. This
 * method returns an array of non-variable BeeCells based on this BeeCell's
 * configuration.
 * @return {BeeCell[]}
 */
BeeCell.prototype.getPossibleGridAssets = function () {
  // Variable configurations are:
  //   Flower or nothing: +nC
  //   Honeycomb or nothing: -nC
  //   Flower or Honeycomb: nC
  //   Flower, Honeycomb, or Nothing: nCany

  var possibilities = [];
  if (this.isVariableCloud()) {
    if (this.isFlower() || !this.prefix_) {
      possibilities.push(new BeeCell(this.originalValue_, CLOUD.STATIC, PREFIX.FLOWER, this.color_));
    }

    if (this.isHive() || !this.prefix_) {
      possibilities.push(new BeeCell(this.originalValue_, CLOUD.STATIC, PREFIX.HIVE));
    }

    if (this.clouded_ === CLOUD.ANY || this.prefix_) {
      possibilities.push(new BeeCell(0, CLOUD.STATIC));
    }
  } else if (this.isVariableRange()) {
    for (var i = this.originalValue_; i <= this.range_; i++) {
      possibilities.push(new BeeCell(i, CLOUD.NONE, PREFIX.FLOWER, FLOWER.PURPLE));
    }
  } else {
    possibilities.push(this);
  }

  return possibilities;
};


/**
 * Generates a new BeeCell from a config string, as provided by
 * Levelbuilder.
 * @return {BeeCell}
 */
BeeCell.parse = function (string) {
  var matches = string.match && string.match(/^(\+|-)?(\d+)((,\d+)?|(R|P)?(FC|C|Cany)?)?$/);
  var value, clouded, prefix, color, range;
  if (matches) {
    prefix = matches[1];
    value = parseInt(matches[2]);
    range = matches[4] && parseInt(matches[4].replace(',' ,''));
    color = matches[5];
    clouded = matches[6];
  } else if (!isNaN(parseInt(string))) {
    value = string;
  }

  return new BeeCell(value, clouded, prefix, color, range);
};
