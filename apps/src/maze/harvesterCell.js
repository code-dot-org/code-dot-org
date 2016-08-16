/**
 * @overview HarvesterCell represents the contets of the grid elements for Bee.
 * Bee HarvesterCells are more complex than many other kinds of cell; they can be
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

const FeatureType = {
  NONE: undefined,
  CORN: 0,
  PUMPKIN: 1,
  WHEAT: 2,
};

const FeatureState = {
  NONE: undefined,
  PLANTED: 0,
  RIPE: 1
};

export default class HarvesterCell extends Cell {
  constructor(tileType, featureType, value, range) {
    super(tileType, value, range);

    /**
     * @type {Number}
     */
    this.featureType_ = featureType;
  }

  featureType() {
    return this.featureType_;
  }

  featureName() {
    if (this.featureType_ === FeatureType.NONE) {
      return 'none';
    }

    return ['corn', 'pumpkin', 'wheat'][this.featureType_];
  }

  isCorn() {
    return this.featureType_ === FeatureType.CORN;
  }

  isPumpkin() {
    return this.featureType_ === FeatureType.PUMPKIN;
  }

  isWheat() {
    return this.featureType_ === FeatureType.WHEAT;
  }

  /**
   * Serializes this HarvesterCell into JSON
   * @return {Object}
   * @override
   */
  serialize() {
    return Object.assign({}, super.serialize(), {
      featureType: this.featureType_,
    });
  }
}

HarvesterCell.deserialize = serialized => new HarvesterCell(
  serialized.tileType,
  serialized.featureType,
  serialized.value,
  serialized.range
);


HarvesterCell.FeatureType = FeatureType;
HarvesterCell.FeatureState = FeatureState;
