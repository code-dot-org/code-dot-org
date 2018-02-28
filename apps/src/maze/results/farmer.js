import ResultsHandler from './resultsHandler';

export default class FarmerHandler extends ResultsHandler {
  /**
   * @override
   */
  succeeded() {
    if (this.maze_.subtype.finish) {
      return super.succeeded();
    }

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
