import Subtype from './subtype';
import { TestResults } from '../constants.js';

export default class Gatherer extends Subtype {

  reset() {
    this.maze_.map.resetDirt();
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
