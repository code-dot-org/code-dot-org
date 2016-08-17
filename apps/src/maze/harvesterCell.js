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
  NONE: 0,
  CORN: 1,
  PUMPKIN: 2,
  WHEAT: 3,
};

export default class HarvesterCell extends Cell {
  constructor(tileType, value, range, possibleFeatures, startsHidden) {

    // possible features should default to an array containing
    // FeatureType.NONE
    if (possibleFeatures === undefined) {
      possibleFeatures = [FeatureType.NONE];
    }

    // if possible features is defined, it should be an array
    if (!Array.isArray(possibleFeatures)) {
      possibleFeatures = [possibleFeatures];
    }

    // If the cell has no features, it should have neither value nor
    // range
    if (possibleFeatures.every(feature => feature === FeatureType.NONE)) {
      value = undefined;
      range = undefined;
    }

    super(tileType, value, range);

    if (possibleFeatures.length > 1) {
      startsHidden = true;
    }

    /**
     * @type {Number}
     */
    this.possibleFeatures_ = possibleFeatures;

    /**
     * @type {Boolean}
     */
    this.startsHidden_ = startsHidden;
  }

  /**
   * Returns a new HarvesterCell that's an exact replica of this one
   * @return {HarvesterCell}
   * @override
   */
  clone() {
    const newHarvesterCell = new HarvesterCell(
      this.tileType_,
      this.originalValue_,
      this.range_,
      this.possibleFeatures_,
      this.startsHidden_
    );
    newHarvesterCell.setCurrentValue(this.currentValue_);
    return newHarvesterCell;
  }

  /**
   * @return {boolean}
   */
  isVariableFeature() {
    return this.possibleFeatures_.length > 1;
  }

  /**
   * @return {boolean}
   * @override
   */
  isVariable() {
    return this.isVariableFeature() || super.isVariable();
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
    if (this.isVariableFeature()) {
      possibilities = this.possibleFeatures_.map(feature =>
        HarvesterCell.deserialize(Object.assign({}, this.serialize(), {
          possibleFeatures: [feature]
        }))
      );
    } else if (this.isVariableRange()) {
      for (let i = this.originalValue_; i <= this.range_; i++) {
        possibilities.push(HarvesterCell.deserialize(Object.assign({}, this.serialize(), {
          value: i,
          range: i
        })));
      }
    } else {
      possibilities.push(this);
    }
    return possibilities;
  }

  featureType() {
    if (this.isVariableFeature()) {
      return undefined;
    }

    return this.possibleFeatures_[0];
  }

  featureName() {
    if (this.isVariableFeature()) {
      return 'unknown';
    }

    const feature = this.possibleFeatures_[0];

    return ['none', 'corn', 'pumpkin', 'wheat'][feature];
  }

  isCorn() {
    return this.possibleFeatures_.includes(FeatureType.CORN);
  }

  isPumpkin() {
    return this.possibleFeatures_.includes(FeatureType.PUMPKIN);
  }

  isWheat() {
    return this.possibleFeatures_.includes(FeatureType.WHEAT);
  }

  /**
   * Serializes this HarvesterCell into JSON
   * @return {Object}
   * @override
   */
  serialize() {
    return Object.assign({}, super.serialize(), {
      possibleFeatures: this.possibleFeatures_,
      startsHidden: this.startsHidden_
    });
  }
}

HarvesterCell.deserialize = serialized => new HarvesterCell(
  serialized.tileType,
  serialized.value,
  serialized.range,
  serialized.possibleFeatures,
  serialized.startsHidden
);


HarvesterCell.FeatureType = FeatureType;
