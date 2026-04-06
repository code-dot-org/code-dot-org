/**
 * HarvesterCell represents the contets of the grid elements for Harvester.
 */

import Cell, {type CellSerialization} from './Cell';
import {SquareType} from './tiles';

export interface HarvesterCellSerialization extends CellSerialization {
  possibleFeatures: number[];
  startsHidden?: boolean;
}

export const FeatureType = {
  NONE: 0,
  CORN: 1,
  PUMPKIN: 2,
  LETTUCE: 3,
};

class HarvesterCell extends Cell {
  possibleFeatures_: number[];
  startsHidden_: boolean;

  static FeatureType = FeatureType;

  constructor(
    tileType: number,
    value?: number,
    range?: number,
    possibleFeatures?: number[],
    startsHidden?: boolean,
  ) {
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

    this.possibleFeatures_ = possibleFeatures;
    this.startsHidden_ = !!startsHidden;
  }

  startsHidden(): boolean {
    return this.startsHidden_;
  }

  isVariableFeature(): boolean {
    return this.possibleFeatures_.length > 1;
  }

  /** @override */
  isVariable(): boolean {
    return this.isVariableFeature() || super.isVariable();
  }

  /**
   * Variable cells can represent multiple possible kinds of grid assets,
   * whereas non-variable cells can represent only a single kind. This
   * method returns an array of non-variable BeeCells based on this BeeCell's
   * configuration.
   * @override
   */
  getPossibleGridAssets(): HarvesterCell[] {
    let possibilities: HarvesterCell[] = [];
    if (this.isVariableFeature()) {
      possibilities = this.possibleFeatures_.map(feature =>
        HarvesterCell.deserialize(
          Object.assign({}, this.serialize(), {
            possibleFeatures: [feature],
          }),
        ),
      );
    } else if (this.isVariableRange()) {
      for (let i = this.originalValue_ || 0; i <= (this.range_ || 0); i++) {
        possibilities.push(
          HarvesterCell.deserialize(
            Object.assign({}, this.serialize(), {
              value: i,
              range: i,
            }),
          ),
        );
      }
    } else {
      possibilities.push(this);
    }
    return possibilities;
  }

  featureType(): number | undefined {
    if (this.isVariableFeature()) {
      return undefined;
    }

    return this.possibleFeatures_[0];
  }

  featureName(): string {
    if (this.isVariableFeature()) {
      return 'unknown';
    }

    const feature = this.possibleFeatures_[0];
    return ['none', 'corn', 'pumpkin', 'lettuce'][feature] || 'unknown';
  }

  isCorn(): boolean {
    return this.possibleFeatures_.includes(FeatureType.CORN);
  }

  isPumpkin(): boolean {
    return this.possibleFeatures_.includes(FeatureType.PUMPKIN);
  }

  isLettuce(): boolean {
    return this.possibleFeatures_.includes(FeatureType.LETTUCE);
  }

  /**
   * Serializes this HarvesterCell into JSON
   * @override
   */
  serialize(): HarvesterCellSerialization {
    return Object.assign({}, super.serialize(), {
      possibleFeatures: this.possibleFeatures_,
      startsHidden: this.startsHidden_,
    });
  }

  /** @override */
  static deserialize(serialized: HarvesterCellSerialization): HarvesterCell {
    return new HarvesterCell(
      serialized.tileType,
      serialized.value,
      serialized.range,
      serialized.possibleFeatures,
      serialized.startsHidden,
    );
  }
}

export default HarvesterCell;
