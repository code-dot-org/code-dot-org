export interface CellSerialization {
  tileType: number;
  value?: number;
  range?: number;
}

export type CellConstructor = new (
  tileType: number,
  value?: number,
  range?: number,
) => Cell;

class Cell {
  tileType_: number;
  originalValue_?: number;
  currentValue_?: number;
  range_?: number;

  constructor(tileType: number, value?: number, range?: number) {
    this.tileType_ = tileType;
    this.originalValue_ = value;
    this.resetCurrentValue();
    this.range_ = range === undefined ? value : range;
  }

  /**
   * Returns a new Cell that's an exact replica of this one
   */
  clone(): Cell {
    const newCell = (this.constructor as typeof Cell).deserialize(
      this.serialize(),
    );
    newCell.setCurrentValue(this.currentValue_);
    return newCell;
  }

  getTile(): number {
    return this.tileType_;
  }

  hasValue(): boolean {
    return this.currentValue_ !== undefined;
  }

  isDirt(): boolean {
    return this.currentValue_ !== undefined;
  }

  isVariableRange(): boolean {
    return this.range_ !== this.originalValue_;
  }

  isVariable(): boolean {
    return this.isVariableRange();
  }

  getOriginalValue(): number | undefined {
    return this.originalValue_;
  }

  getCurrentValue(): number | undefined {
    return this.currentValue_;
  }

  setCurrentValue(val?: number) {
    this.currentValue_ = val;
  }

  resetCurrentValue() {
    this.currentValue_ = this.originalValue_;
  }

  /**
   * Variable cells can represent a range of possible values. This method
   * returns an array of non-variable Cells based on this Cell's
   * configuration.
   */
  getPossibleGridAssets(): Cell[] {
    const possibilities = [];
    if (this.isVariableRange()) {
      // range can be greater than or less than original value
      const min = Math.min(this.originalValue_ || 0, this.range_ || 0);
      const max = Math.max(this.originalValue_ || 0, this.range_ || 0);
      for (let i = min; i <= max; i++) {
        possibilities.push(new Cell(this.tileType_, i));
      }
    } else {
      possibilities.push(this);
    }

    return possibilities;
  }

  /**
   * Serializes this Cell into JSON
   */
  serialize(): CellSerialization {
    return {
      tileType: this.tileType_,
      value: this.originalValue_,
      range: this.range_,
    };
  }

  /**
   * Creates a new Cell from serialized JSON
   */
  static deserialize(serialized: CellSerialization) {
    return new Cell(serialized.tileType, serialized.value, serialized.range);
  }

  /**
   * Creates a new Cell from a mapCell and an initialDirtCell. This
   * represents the old style of storing map data, and should not be used
   * for any new levels. Note that this style does not support new
   * features such as dynamic ranges or new cloud types. Only used for
   * backwards compatibility.
   */
  static parseFromOldValues(
    mapCell: string | number,
    initialDirtCell: string | number | undefined,
  ): Cell {
    mapCell = parseInt(mapCell.toString());
    initialDirtCell =
      initialDirtCell === undefined
        ? undefined
        : parseInt(initialDirtCell.toString());

    let value;
    const tileType = parseInt(mapCell.toString());
    if (initialDirtCell !== undefined && initialDirtCell !== 0) {
      value = initialDirtCell;
    }

    return new Cell(tileType, value);
  }
}

export default Cell;
