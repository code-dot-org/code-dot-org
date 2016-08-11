import Subtype from './subtype';

export default class Farmer extends Subtype {

  /**
   * @override
   */
  isFarmer() {
    return true;
  }

  /**
   * @override
   */
  finished() {
    return this.isDirtCorrect_();
  }

  /**
   * Returns true iff there are no piles or holes anywhere on the map
   * @returns boolean
   */
  isDirtCorrect_() {
    for (var row = 0; row < this.maze_.map.ROWS; row++) {
      for (var col = 0; col < this.maze_.map.COLS; col++) {
        if (this.maze_.map.isDirt(row, col) && this.maze_.map.getValue(row, col) !== 0) {
          return false;
        }
      }
    }
    return true;
  }
}
