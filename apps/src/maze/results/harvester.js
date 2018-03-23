import GathererHandler from './gatherer';

import mazeMsg from '../locale';
import { HarvesterTerminationValue, TestResults } from '../../constants.js';

export default class HarvesterHandler extends GathererHandler {
  constructor(maze, config) {
    super(maze, config);

    // Initialize subtype-specific event listeners

    this.maze_.subtype.on('wrongCrop', () => {
      this.executionInfo.terminateWithValue(HarvesterTerminationValue.WRONG_CROP);
    });

    this.maze_.subtype.on('emptyCrop', () => {
      this.executionInfo.terminateWithValue(HarvesterTerminationValue.EMPTY_CROP);
    });
  }

  /**
   * @override
   */
  succeeeded() {
    return this.collectedEverything();
  }

  /**
   * @override
   */
  terminateWithAppSpecificValue() {
    const executionInfo = this.executionInfo;

    if (!this.collectedEverything()) {
      executionInfo.terminateWithValue(HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING);
    }
  }

  /**
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case HarvesterTerminationValue.WRONG_CROP:
      case HarvesterTerminationValue.EMPTY_CROP:
        return TestResults.APP_SPECIFIC_FAIL;

      case HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING:
        var testResults = this.maze_.getTestResults(true);
        // If we have a non-app specific failure, we want that to take precedence.
        // Values over TOO_MANY_BLOCKS_FAIL are not true failures, but indicate
        // a suboptimal solution, so in those cases we want to return our
        // app specific fail. Same goes for BLOCK_LIMIT_FAIL.
        if (testResults >= TestResults.TOO_MANY_BLOCKS_FAIL || testResults === TestResults.BLOCK_LIMIT_FAIL) {
          testResults = TestResults.APP_SPECIFIC_FAIL;
        }
        return testResults;
    }

    return super.getTestResults(terminationValue);
  }

  /**
   * @override
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case HarvesterTerminationValue.WRONG_CROP:
        return mazeMsg.wrongCropError();
      case HarvesterTerminationValue.EMPTY_CROP:
        return mazeMsg.emptyCropError();
      case HarvesterTerminationValue.DID_NOT_COLLECT_EVERYTHING:
        return mazeMsg.didNotCollectAllCrops();
      default:
        return super.getMessage(terminationValue);
    }
  }
}
