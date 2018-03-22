/**
 * @overview PlanterCell represents the contets of the grid elements for Planter.
 * PlanterCells can start as empty, soil, or a sprout, and can be
 * changed by the user from soil to sprout.
 */

import Cell from './cell';
const FeatureType = {
  NONE: 0,
  SOIL: 1,
  SPROUT: 2,
};

export default class PlanterCell extends Cell {
  constructor(tileType, featureType) {
    if (featureType === undefined) {
      featureType = FeatureType.NONE;
    }

    super(tileType);

    /**
     * @type {Number}
     */
    this.originalFeatureType_ = featureType;

    /**
     * @type {Number}
     */
    this.currentFeatureType_ = undefined;
    this.resetCurrentFeature();
  }

  setFeatureType(type) {
    this.currentFeatureType_ = type;
  }

  featureType() {
    return this.currentFeatureType_;
  }

  originalFeatureType() {
    return this.originalFeatureType_;
  }

  resetCurrentFeature() {
    this.currentFeatureType_ = this.originalFeatureType_;
  }

  featureName() {
    const feature = this.currentFeatureType_;

    return ['none', 'soil', 'sprout'][feature];
  }

  isSoil() {
    return this.currentFeatureType_ === FeatureType.SOIL;
  }

  isSprout() {
    return this.currentFeatureType_ === FeatureType.SPROUT;
  }

  /**
   * Serializes this PlanterCell into JSON
   * @return {Object}
   * @override
   */
  serialize() {
    return Object.assign({}, super.serialize(), {
      featureType: this.originalFeatureType_,
    });
  }
}

PlanterCell.deserialize = serialized => new PlanterCell(
  serialized.tileType,
  serialized.featureType
);

PlanterCell.FeatureType = FeatureType;
