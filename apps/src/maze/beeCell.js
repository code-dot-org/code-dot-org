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

import Cell from './cell';
import tiles from './tiles';
const SquareType = tiles.SquareType;

export default class BeeCell extends Cell {
  constructor(tileType, featureType, value, cloudType, flowerColor, range) {

    // BeeCells require features to have values
    if (featureType === BeeCell.FeatureType.NONE) {
      value = undefined;
      range = undefined;
    }

    super(tileType, value, range);

    /**
     * @type {Number}
     */
    this.featureType_ = featureType;

    /**
     * @type {Number}
     */
    this.flowerColor_ = flowerColor;

    /**
     * @type {Number}
     */
    this.cloudType_ = cloudType;
  }

  /**
   * @return {boolean}
   */
  isFlower() {
    return this.featureType_ === FeatureType.FLOWER;
  }

  /**
   * @return {boolean}
   */
  isHive() {
    return this.featureType_ === FeatureType.HIVE;
  }

  /**
   * Flowers can be red, purple, or undefined.
   * @return {boolean}
   */
  isRedFlower() {
    return this.isFlower() && this.flowerColor_ === FlowerColor.RED;
  }

  /**
   * Flowers can be red, purple, or undefined.
   * @return {boolean}
   */
  isPurpleFlower() {
    return this.isFlower() && this.flowerColor_ === FlowerColor.PURPLE;
  }

  /**
   * @return {boolean}
   */
  isStaticCloud() {
    return this.cloudType_ === CloudType.STATIC;
  }

  /**
   * @return {boolean}
   */
  isVariableCloud() {
    if (this.cloudType_ === CloudType.NONE || this.cloudType_ === CloudType.STATIC) {
      return false;
    }
    return true;
  }

  /**
   * @return {boolean}
   */
  isVariable() {
    return this.isVariableRange() || this.isVariableCloud();
  }

  /**
   * Variable cells can represent multiple possible kinds of grid assets,
   * whereas non-variable cells can represent only a single kind. This
   * method returns an array of non-variable BeeCells based on this BeeCell's
   * configuration.
   * @return {BeeCell[]}
   * @override
   */
  getPossibleGridAssets() {
    let possibilities = [];
    if (this.isVariableCloud()) {
      const flower = new BeeCell(this.tileType_, FeatureType.FLOWER, this.originalValue_, CloudType.STATIC, this.flowerColor_);
      const hive = new BeeCell(this.tileType_, FeatureType.HIVE, this.originalValue_, CloudType.STATIC);
      const nothing = new BeeCell(this.tileType_, FeatureType.NONE, undefined, CloudType.STATIC);
      switch (this.cloudType_) {
        case CloudType.HIVE_OR_FLOWER:
          possibilities = [flower, hive];
          break;
        case CloudType.FLOWER_OR_NOTHING:
          possibilities = [flower, nothing];
          break;
        case CloudType.HIVE_OR_NOTHING:
          possibilities = [hive, nothing];
          break;
        case CloudType.ANY:
          possibilities = [flower, hive, nothing];
          break;
      }
    } else if (this.isVariableRange()) {
      for (let i = this.originalValue_; i <= this.range_; i++) {
        possibilities.push(new BeeCell(this.tileType_, FeatureType.FLOWER, i, CloudType.NONE, FlowerColor.PURPLE));
      }
    } else {
      possibilities.push(this);
    }

    return possibilities;
  }

  /**
   * Serializes this BeeCell into JSON
   * @return {Object}
   * @override
   */
  serialize() {
    return Object.assign({}, super.serialize(), {
      featureType: this.featureType_,
      cloudType: this.cloudType_,
      flowerColor: this.flowerColor_,
    });
  }
}

const FeatureType = BeeCell.FeatureType = {
  NONE: undefined,
  HIVE: 0,
  FLOWER: 1,
  VARIABLE: 2
};

const CloudType = BeeCell.CloudType = {
  NONE: undefined,
  STATIC: 0,
  HIVE_OR_FLOWER: 1,
  FLOWER_OR_NOTHING: 2,
  HIVE_OR_NOTHING: 3,
  ANY: 4
};

const FlowerColor = BeeCell.FlowerColor = {
  DEFAULT: undefined,
  RED: 0,
  PURPLE: 1
};

/**
 * Creates a new BeeCell from serialized JSON
 * @param {Object}
 * @return {BeeCell}
 * @override
 */
BeeCell.deserialize = serialized => new BeeCell(
  serialized.tileType,
  serialized.featureType,
  serialized.value,
  serialized.cloudType,
  serialized.flowerColor,
  serialized.range
);

/**
 * @param {String|Number} mapCell
 * @param {String|Number} initialDirtCell
 * @return {BeeCell}
 * @override
 * @see Cell.parseFromOldValues
 */
BeeCell.parseFromOldValues = (mapCell, initialDirtCell) => {
  mapCell = mapCell.toString();
  initialDirtCell = parseInt(initialDirtCell);
  let tileType, featureType, value, cloudType, flowerColor;

  if (!isNaN(initialDirtCell) && mapCell.match(/[1|R|P|FC]/) && initialDirtCell !== 0) {
    tileType = SquareType.OPEN;
    featureType = initialDirtCell > 0 ? FeatureType.FLOWER : FeatureType.HIVE;
    value = Math.abs(initialDirtCell);
    cloudType = (mapCell === 'FC') ? CloudType.STATIC : CloudType.NONE;
    flowerColor = (mapCell === 'R') ? FlowerColor.RED : (mapCell === 'P') ? FlowerColor.PURPLE : FlowerColor.DEFAULT;
  } else {
    tileType = parseInt(mapCell);
  }
  return new BeeCell(tileType, featureType, value, cloudType, flowerColor);
};
