import Cell from './Cell';
import DirtDrawer from './DirtDrawer';
import Subtype from './Subtype';

class Farmer<T extends Cell> extends Subtype<T, DirtDrawer> {
  /** @override */
  isFarmer(): boolean {
    return true;
  }

  /**
   * Goal-based win check (no finish tile — see Validator.succeeded()): every
   * pile filled and every hole dug, i.e. no dirt cell left non-zero.
   * @override
   */
  succeeded(): boolean {
    const rows = this.maze_.map?.ROWS ?? 0;
    const cols = this.maze_.map?.COLS ?? 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (this.getCell(row, col)?.isDirt() && this.getValue(row, col) !== 0) {
          return false;
        }
      }
    }
    return true;
  }
}

export default Farmer;
