import ResultsHandler from './resultsHandler';
import { TestResults } from '../../constants.js';

export default class GathererHandler extends ResultsHandler {

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
  succeeded() {
    return this.collectedEverything();
  }

  /**
   * @override
   */
  hasMessage(testResults) {
    return testResults === TestResults.APP_SPECIFIC_FAIL;
  }
}
