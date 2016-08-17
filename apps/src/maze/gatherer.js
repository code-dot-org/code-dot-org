import Subtype from './subtype';
import { TestResults } from '../constants.js';

export default class Gatherer extends Subtype {

  reset() {
    this.maze_.map.resetDirt();
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @returns {Number} val
   */
  getValue(row, col) {
    return this.getCell(row, col).getCurrentValue();
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @param {Number} val
   */
  setValue(row, col, val) {
    this.getCell(row, col).setCurrentValue(val);
  }

  /**
   * @param {Number} row
   * @param {Number} col
   * @returns {Object} cell
   */
  getCell(row, col) {
    return this.maze_.map.currentStaticGrid[row][col];
  }

  /**
   * @return {boolean}
   */
  collectedEverything() {
    const missedSomething = this.maze_.map.currentStaticGrid.some(
      row => row.some(cell => cell.isDirt() && cell.getCurrentValue() > 0)
    );

    return !missedSomething;
  }

  /**
   * Did we reach our total nectar/honey goals?
   * @return {boolean}
   * @override
   */
  finished() {
    return this.collectedEverything();
  }

  /**
   * @override
   */
  hasMessage(testResults) {
    return testResults === TestResults.APP_SPECIFIC_FAIL;
  }

  playAudio_(sound) {
    // Check for StudioApp, which will often be undefined in unit tests
    if (this.studioApp_) {
      this.studioApp_.playAudio(sound);
    }
  }
}
