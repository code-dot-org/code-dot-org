import Cell, {type CellSerialization} from './Cell';

export interface NeighborhoodCellSerialization extends CellSerialization {
  assetId: number;
  color?: string;
}

class NeighborhoodCell extends Cell {
  assetId: number;
  color?: string;

  // value is paint count
  constructor(
    tileType: number,
    value?: number,
    assetId?: number,
    color?: string,
  ) {
    super(tileType, value);

    this.assetId = assetId || 0;
    this.color = color;
  }

  getColor(): string | undefined {
    return this.color;
  }

  setColor(color?: string) {
    this.color = color;
  }

  getAssetId() {
    return this.assetId;
  }

  /**
   * Serializes this NeighborhoodCell into JSON
   * @override
   */
  serialize(): NeighborhoodCellSerialization {
    return {
      ...super.serialize(),
      assetId: this.assetId,
      color: this.color,
    };
  }

  /** @override */
  static deserialize(
    serialized: NeighborhoodCellSerialization,
  ): NeighborhoodCell {
    return new NeighborhoodCell(
      serialized.tileType,
      serialized.value,
      serialized.assetId,
      serialized.color,
    );
  }
}

export default NeighborhoodCell;
