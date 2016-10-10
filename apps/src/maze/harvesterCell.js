/**
 * @overview HarvesterCell represents the contets of the grid elements for Harvester.
 */

import Cell from './cell';
import tiles from './tiles';
const SquareType = tiles.SquareType;

const FeatureType = {
  NONE: 0,
  CORN: 1,
  PUMPKIN: 2,
  LETTUCE: 3,
};

export default class HarvesterCell extends Cell {
  constructor(tileType, value, range, possibleFeatures, startsHidden) {

    // possible features should default to an array containing
    // FeatureType.NONE, and should only be allowed to be anything else
    // if this is an Open tile.
    if (possibleFeatures === undefined || tileType !== SquareType.OPEN) {
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
    this.startsHidden_ = !!startsHidden;
  }

  /**
   * @return {boolean}
   */
  startsHidden() {
    return this.startsHidden_;
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

    return ['none', 'corn', 'pumpkin', 'lettuce'][feature];
  }

  isCorn() {
    return this.possibleFeatures_.includes(FeatureType.CORN);
  }

  isPumpkin() {
    return this.possibleFeatures_.includes(FeatureType.PUMPKIN);
  }

  isLettuce() {
    return this.possibleFeatures_.includes(FeatureType.LETTUCE);
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
