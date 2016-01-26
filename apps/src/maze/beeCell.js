/**
 * @overview Cell represents the contets of the grid elements for Bee.
 * Bee Cells are more complex than many other kinds of cell; they can be
 * "hidden" with clouds, they can represent multiple different kinds of
 * element (flower, hive), some of which can be multiple colors (red,
 * purple), and which can have a range of possible values.
 *
 * Some cells can also be "variable", meaning that their contents are
 * not static but can in fact be randomized between runs.
 */

// FC is short for FlowerComb, which we were originally using instead of cloud
var CLOUD_MARKER = 'FC';

var Cell = function (value, clouded, prefix, color) {
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
  this.originalValue_ = value;

  /**
   * @type {Number}
   */
  this.currentValue_ = undefined;
  this.resetCurrentValue();
};

module.exports = Cell;

/**
 * Returns a new Cell that's an exact replica of this one
 * @return {Cell}
 */
Cell.prototype.clone = function () {
  var newCell = new Cell(this.originalValue_, this.clouded_, this.prefix_, this.color_);
  newCell.setCurrentValue(this.currentValue_);
  return newCell;
};

/**
 * @return {Number}
 */
Cell.prototype.getCurrentValue = function () {
  return this.currentValue_;
};

/**
 * @param {Number}
 */
Cell.prototype.setCurrentValue = function (val) {
  this.currentValue_ = val;
};

Cell.prototype.resetCurrentValue = function () {
  if (this.prefix_) {
    this.currentValue_ = parseInt(this.prefix_ + this.originalValue_);
  } else {
    this.currentValue_ = 0;
  }
};

Cell.prototype.isFlower = function () {
  return this.prefix_ === '+';
};

Cell.prototype.isHive = function () {
  return this.prefix_ === '-';
};

Cell.prototype.isClouded = function () {
  return this.clouded_ === CLOUD_MARKER;
};

Cell.prototype.getColor = function () {
  return this.color_;
};

/**
 * Possible values for 'clouded' are "FC", "C", or "Cany".  FC
 * represents an old-style, static cloud. C and Cany represent new,
 * variable clouds
 * @return {boolean}
 */
Cell.prototype.isVariable = function () {
  return (this.clouded_ === 'C' || this.clouded_ === 'Cany');
};

/**
 * Variable cells can represent multiple possible kinds of grid assets,
 * whereas non-variable cells can represent only a single kind. This
 * method returns an array of non-variable Cells based on this Cell's
 * configuration.
 * @return {Cell[]}
 */
Cell.prototype.getPossibleGridAssets = function () {
  // Variable configurations are:
  //   Flower or nothing: +nC
  //   Honeycomb or nothing: -nC
  //   Flower or Honeycomb: nC
  //   Flower, Honeycomb, or Nothing: nCany

  if (this.isVariable()) {
    var thisCanBeA = {
      flower: true,
      honeycomb: true,
      nothing: false,
    };
    if (this.clouded_ === 'Cany') {
      thisCanBeA.nothing = true;
    } else if (this.prefix_) {
      thisCanBeA.nothing = true;
      thisCanBeA.flower = this.isFlower();
      thisCanBeA.honeycomb = this.isHive();
    }

    var possibilities = [];
    if (thisCanBeA.flower) {
      possibilities.push(new Cell(this.originalValue_, CLOUD_MARKER, '+', this.color_));
    }
    if (thisCanBeA.honeycomb) {
      possibilities.push(new Cell(this.originalValue_, CLOUD_MARKER, '-'));
    }
    if (thisCanBeA.nothing) {
      possibilities.push(new Cell(0, CLOUD_MARKER));
    }
    return possibilities;
  }

  return [this];
};


/**
 * Generates a new Cell from a config string, as provided by
 * Levelbuilder.
 * @return {Cell}
 */
Cell.parse = function (string) {
  var matches = string.match && string.match(/^(\+|-)?(\d+)(R|P)?(FC|C|Cany)?$/);
  var value, clouded, prefix, color;
  if (matches) {
    prefix = matches[1];
    value = parseInt(matches[2]);
    color = matches[3];
    clouded = matches[4];
  } else {
    value = string;
  }

  // TODO: when we add numeric ranges, this becomes:
  /*
  var matches = cell.match && cell.match(/^(\+|-)?(\d+)(,\d+)?(R|P)?(FC|C|Cany)?$/);
  return {
    prefix: matches[1],
    value: matches[2],
    range: matches[3],
    color: matches[4],
    clouded: matches[5],
  };
  */

  return new Cell(value, clouded, prefix, color);
};
