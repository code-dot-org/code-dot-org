import Gatherer from './gatherer';
import mazeMsg from '../locale';
import {
  TestResults,
  BeeTerminationValue as TerminationValue
} from '../../constants.js';

export default class Bee extends Gatherer {
  constructor(maze, config) {
    super(maze, config);

    this.nectarGoal_ = config.level.nectarGoal || 0;
    this.honeyGoal_ = config.level.honeyGoal || 0;
  }

  /**
   * Did we reach our total nectar/honey goals?
   * @return {boolean}
   * @override
   */
  succeeded() {
    // nectar/honey goals
    if (this.maze_.subtype < this.honeyGoal_ || this.maze_.subtype.length < this.nectarGoal_) {
      return false;
    }

    if (!this.checkedAllClouded() || !this.checkedAllPurple()) {
      return false;
    }

    return super.succeeded();
  }

  /**
   * @override
   */
  collectedEverything() {
    // quantum maps implicity require "collect everything", non-quantum
    // maps don't really care
    if (!this.maze_.map.hasMultiplePossibleGrids()) {
      return true;
    }

    return super.collectedEverything();
  }

  /**
   * @override
   */
  terminateWithAppSpecificValue() {
    const executionInfo = this.maze_.executionInfo;

    if (this.maze_.subtype.length < this.nectarGoal_) {
      executionInfo.terminateWithValue(TerminationValue.INSUFFICIENT_NECTAR);
    } else if (this.maze_.subtype < this.honeyGoal_) {
      executionInfo.terminateWithValue(TerminationValue.INSUFFICIENT_HONEY);
    } else if (!this.checkedAllClouded()) {
      executionInfo.terminateWithValue(TerminationValue.UNCHECKED_CLOUD);
    } else if (!this.checkedAllPurple()) {
      executionInfo.terminateWithValue(TerminationValue.UNCHECKED_PURPLE);
    } else if (!this.collectedEverything()) {
      executionInfo.terminateWithValue(TerminationValue.DID_NOT_COLLECT_EVERYTHING);
    }
  }

  /**
   * Did we check every flower/honey that was covered by a cloud?
   */
  checkedAllClouded() {
    for (let row = 0; row < this.maze_.map.currentStaticGrid.length; row++) {
      for (let col = 0; col < this.maze_.map.currentStaticGrid[row].length; col++) {
        if (this.maze_.subtype.shouldCheckCloud(row, col) && !this.maze_.subtype.checkedCloud(row, col)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Did we check every purple flower
   */
  checkedAllPurple() {
    for (let row = 0; row < this.maze_.map.currentStaticGrid.length; row++) {
      for (let col = 0; col < this.maze_.map.currentStaticGrid[row].length; col++) {
        if (this.maze_.subtype.shouldCheckPurple(row, col) && !this.maze_.subtype[row][col].checkedForNectar) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case TerminationValue.NOT_AT_FLOWER:
      case TerminationValue.FLOWER_EMPTY:
      case TerminationValue.NOT_AT_HONEYCOMB:
      case TerminationValue.HONEYCOMB_FULL:
        return TestResults.APP_SPECIFIC_FAIL;

      case TerminationValue.UNCHECKED_CLOUD:
      case TerminationValue.UNCHECKED_PURPLE:
      case TerminationValue.INSUFFICIENT_NECTAR:
      case TerminationValue.INSUFFICIENT_HONEY:
      case TerminationValue.DID_NOT_COLLECT_EVERYTHING:
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
      case TerminationValue.NOT_AT_FLOWER:
        return mazeMsg.notAtFlowerError();
      case TerminationValue.FLOWER_EMPTY:
        return mazeMsg.flowerEmptyError();
      case TerminationValue.NOT_AT_HONEYCOMB:
        return mazeMsg.notAtHoneycombError();
      case TerminationValue.HONEYCOMB_FULL:
        return mazeMsg.honeycombFullError();
      case TerminationValue.UNCHECKED_CLOUD:
        return mazeMsg.uncheckedCloudError();
      case TerminationValue.UNCHECKED_PURPLE:
        return mazeMsg.uncheckedPurpleError();
      case TerminationValue.INSUFFICIENT_NECTAR:
        return mazeMsg.insufficientNectar();
      case TerminationValue.INSUFFICIENT_HONEY:
        return mazeMsg.insufficientHoney();
      case TerminationValue.DID_NOT_COLLECT_EVERYTHING:
        return mazeMsg.didNotCollectEverything();
      default:
        return super.getMessage(terminationValue);
    }
  }
}
