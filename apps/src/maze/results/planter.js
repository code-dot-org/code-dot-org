import ResultsHandler from './resultsHandler';
import mazeMsg from '../locale';
import { TestResults } from '../../constants.js';

export default class PlanterHandler extends ResultsHandler {
  static TerminationValue = {
    PLANT_IN_NON_SOIL: 0,
    DID_NOT_PLANT_EVERYWHERE: 1,
  };

  constructor(maze, config) {
    super(maze, config);

    // Initialize subtype-specific event listeners

    this.maze_.subtype.on('plantInNonSoil', () => {
      this.executionInfo.terminateWithValue(PlanterHandler.TerminationValue.PLANT_IN_NON_SOIL);
    });
  }

  /**
   * @override
   */
  succeeded() {
    return this.plantedEverything();
  }

  /**
   * Has the user planted everywhere they can plant? Alternatively, are
   * there zero Soil cells?
   */
  plantedEverything() {
    const anySoilCells = this.maze_.map.getAllCells().some(cell => cell.isSoil());
    return !anySoilCells;
  }

  /**
   * @override
   */
  shouldCheckSuccessOnMove() {
    return false;
  }

  /**
   * @override
   */
  terminateWithAppSpecificValue() {
    const executionInfo = this.executionInfo;

    if (!this.plantedEverything()) {
      executionInfo.terminateWithValue(PlanterHandler.TerminationValue.DID_NOT_PLANT_EVERYWHERE);
    }
  }

  /**
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case PlanterHandler.TerminationValue.PLANT_IN_NON_SOIL:
        return TestResults.APP_SPECIFIC_FAIL;
      case PlanterHandler.TerminationValue.DID_NOT_PLANT_EVERYWHERE:
        var testResults = this.maze_.getTestResults(true);
        // If we have a non-app specific failure, we want that to take precedence.
        // Values over TOO_MANY_BLOCKS_FAIL are not true failures, but indicate
        // a suboptimal solution, so in those cases we want to return our
        // app specific fail. Same goes for BLOCK_LIMIT_FAIL.
        if (testResults >= TestResults.TOO_MANY_BLOCKS_FAIL || testResults === TestResults.BLOCK_LIMIT_FAIL) {
          testResults = TestResults.APP_SPECIFIC_FAIL;
        }
        return testResults;
      default:
        return super.getTestResults(terminationValue);
    }
  }

  /**
   * @override
   */
  hasMessage(testResults) {
    return testResults === TestResults.APP_SPECIFIC_FAIL;
  }

  /**
   * @override
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case PlanterHandler.TerminationValue.PLANT_IN_NON_SOIL:
        return mazeMsg.plantInNonSoilError();
      case PlanterHandler.TerminationValue.DID_NOT_PLANT_EVERYWHERE:
        return mazeMsg.didNotPlantEverywhere();
      default:
        return super.getMessage(terminationValue);
    }
  }
}
