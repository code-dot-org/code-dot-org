/**
 * PlanterCell represents the contets of the grid elements for Planter.
 * PlanterCells can start as empty, soil, or a sprout, and can be
 * changed by the user from soil to sprout.
 */

import Cell, {type CellSerialization} from './Cell';

export interface PlanterCellSerialization extends CellSerialization {
  featureType: number;
}

export const FeatureType = {
  NONE: 0,
  SOIL: 1,
  SPROUT: 2,
};

class PlanterCell extends Cell {
  featureType_?: number;
  originalFeatureType_: number;
  currentFeatureType_: number;

  static FeatureType = FeatureType;

  constructor(tileType: number, featureType?: number) {
    if (featureType === undefined) {
      featureType = FeatureType.NONE;
    }

    super(tileType, 0);

    this.originalFeatureType_ = featureType;
    this.currentFeatureType_ = featureType;
    this.resetCurrentFeature();
  }

  setFeatureType(type: number) {
    this.currentFeatureType_ = type;
  }

  featureType(): number {
    return this.currentFeatureType_;
  }

  originalFeatureType(): number {
    return this.originalFeatureType_;
  }

  resetCurrentFeature() {
    this.currentFeatureType_ = this.originalFeatureType_;
  }

  featureName(): string {
    const feature = this.currentFeatureType_;

    return ['none', 'soil', 'sprout'][feature] as string;
  }

  isSoil(): boolean {
    return this.currentFeatureType_ === FeatureType.SOIL;
  }

  isSprout(): boolean {
    return this.currentFeatureType_ === FeatureType.SPROUT;
  }

  /**
   * Serializes this PlanterCell into JSON
   * @override
   */
  serialize(): PlanterCellSerialization {
    return Object.assign({}, super.serialize(), {
      featureType: this.originalFeatureType_,
    });
  }

  /** @override */
  static deserialize(serialized: PlanterCellSerialization): PlanterCell {
    return new PlanterCell(serialized.tileType, serialized.featureType);
  }
}

export default PlanterCell;
