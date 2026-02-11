import Cell, {type CellSerialization} from './Cell';
import {SquareType} from './tiles';

export const FeatureType = {
  NONE: undefined,
  HIVE: 0,
  FLOWER: 1,
  VARIABLE: 2,
};

export const CloudType = {
  NONE: undefined,
  STATIC: 0,
  HIVE_OR_FLOWER: 1,
  FLOWER_OR_NOTHING: 2,
  HIVE_OR_NOTHING: 3,
  ANY: 4,
};

export const FlowerColor = {
  DEFAULT: undefined,
  RED: 0,
  PURPLE: 1,
};

export interface BeeCellSerialization extends CellSerialization {
  featureType?: number;
  cloudType?: number;
  flowerColor?: number;
}

class BeeCell extends Cell {
  featureType_?: number;
  flowerColor_?: number;
  cloudType_?: number;

  static FeatureType = FeatureType;
  static CloudType = CloudType;
  static FlowerColor = FlowerColor;

  constructor(
    tileType: number,
    featureType?: number,
    value?: number,
    cloudType?: number,
    flowerColor?: number,
    range?: number,
  ) {
    // BeeCells require features to have values
    if (featureType === BeeCell.FeatureType.NONE) {
      value = undefined;
      range = undefined;
    }

    super(tileType, value, range);

    this.featureType_ = featureType;
    this.flowerColor_ = flowerColor;
    this.cloudType_ = cloudType;
  }

  isFlower(): boolean {
    return this.featureType_ === FeatureType.FLOWER;
  }

  isHive(): boolean {
    return this.featureType_ === FeatureType.HIVE;
  }

  /**
   * Flowers can be red, purple, or undefined.
   */
  isRedFlower(): boolean {
    return this.isFlower() && this.flowerColor_ === FlowerColor.RED;
  }

  /**
   * Flowers can be red, purple, or undefined.
   */
  isPurpleFlower(): boolean {
    return this.isFlower() && this.flowerColor_ === FlowerColor.PURPLE;
  }

  isStaticCloud(): boolean {
    return this.cloudType_ === CloudType.STATIC;
  }

  isVariableCloud(): boolean {
    if (
      this.cloudType_ === CloudType.NONE ||
      this.cloudType_ === CloudType.STATIC
    ) {
      return false;
    }
    return true;
  }

  isVariable(): boolean {
    return this.isVariableRange() || this.isVariableCloud();
  }

  /**
   * Variable cells can represent multiple possible kinds of grid assets,
   * whereas non-variable cells can represent only a single kind. This
   * method returns an array of non-variable BeeCells based on this BeeCell's
   * configuration.
   */
  getPossibleGridAssets(): BeeCell[] {
    let possibilities: BeeCell[] = [];
    if (this.isVariableCloud()) {
      const flower = new BeeCell(
        this.tileType_,
        FeatureType.FLOWER,
        this.originalValue_,
        CloudType.STATIC,
        this.flowerColor_,
      );
      const hive = new BeeCell(
        this.tileType_,
        FeatureType.HIVE,
        this.originalValue_,
        CloudType.STATIC,
      );
      const nothing = new BeeCell(
        this.tileType_,
        FeatureType.NONE,
        undefined,
        CloudType.STATIC,
      );
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
      for (let i = this.originalValue_ || 0; i <= (this.range_ || 0); i++) {
        possibilities.push(
          new BeeCell(
            this.tileType_,
            FeatureType.FLOWER,
            i,
            CloudType.NONE,
            FlowerColor.PURPLE,
          ),
        );
      }
    } else {
      possibilities.push(this);
    }

    return possibilities;
  }

  /**
   * Serializes this BeeCell into JSON
   */
  serialize(): BeeCellSerialization {
    return {
      ...super.serialize(),
      featureType: this.featureType_,
      cloudType: this.cloudType_,
      flowerColor: this.flowerColor_,
    };
  }

  /**
   * Creates a new BeeCell from serialized JSON
   */
  static deserialize(serialized: BeeCellSerialization) {
    return new BeeCell(
      serialized.tileType,
      serialized.featureType,
      serialized.value,
      serialized.cloudType,
      serialized.flowerColor,
      serialized.range,
    );
  }

  /**
   * @see Cell.parseFromOldValues
   */
  static parseFromOldValues(
    mapCell: string | number,
    initialDirtCell: string | number,
  ): BeeCell {
    mapCell = mapCell.toString();
    initialDirtCell = parseInt(initialDirtCell.toString());
    let tileType, featureType, value, cloudType, flowerColor;

    if (
      !isNaN(initialDirtCell) &&
      mapCell.match(/[1|R|P|FC]/) &&
      initialDirtCell !== 0
    ) {
      tileType = SquareType.OPEN;
      featureType = initialDirtCell > 0 ? FeatureType.FLOWER : FeatureType.HIVE;
      value = Math.abs(initialDirtCell);
      cloudType = mapCell === 'FC' ? CloudType.STATIC : CloudType.NONE;
      flowerColor =
        mapCell === 'R'
          ? FlowerColor.RED
          : mapCell === 'P'
            ? FlowerColor.PURPLE
            : FlowerColor.DEFAULT;
    } else {
      tileType = parseInt(mapCell);
    }
    return new BeeCell(tileType, featureType, value, cloudType, flowerColor);
  }
}

export default BeeCell;
