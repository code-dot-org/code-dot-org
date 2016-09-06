/**
 * @fileoverview defines a new Maze Level sub-type: Collector.
 * Collector levels are simple Maze levels that define a set of
 * collectible items on the screen which the user can programmatically
 * collect, and which strictly enforce the concept of block limits.
 * Success is primarily determined by remaining within the block limit,
 * and secondarily determined by collecting at least one of the
 * available collectibles.
 */

import { TestResults } from '../constants.js';

import Subtype from './subtype';
import CollectorDrawer from './collectorDrawer';
import mazeMsg from './locale';
import tiles from './tiles';

const TOO_MANY_BLOCKS = 0;
const COLLECTED_NOTHING = 1;
const COLLECTED_SOME = 2;
const COLLECTED_EVERYTHING = 3;
const COLLECTED_TOO_MANY = 4;

export default class Collector extends Subtype {
  constructor(maze, studioApp, config) {
    super(maze, studioApp, config);

    // Collector level types treat the "ideal" block count as a hard
    // requirement
    this.maxBlocks_ = config.level.ideal;
  }

  /**
   * @override
   */
  isCollector() {
    return true;
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
  createDrawer() {
    this.drawer = new CollectorDrawer(this.maze_.map, this.skin_.goal);
  }

  /**
   * @return {boolean} Did the user try to collect too many things from
   * a space?
   */
  collectedTooMany() {
    let tooMany = false;
    this.maze_.map.forEachCell((cell, x, y) => {
      if (cell.isDirt() &&
          (cell.getCurrentValue() < 0 || isNaN(cell.getCurrentValue()))) {
        tooMany = true;
      }
    });
    return tooMany;
  }

  /**
   * @return {boolean} Has the user collected all available collectibles?
   */
  collectedAll() {
    return this.getTotalCollected() === this.getPotentialMaxCollected();
  }

  /**
   * @return {number} The total number of available collectibles
   */
  getPotentialMaxCollected() {
    let count = 0;
    this.maze_.map.forEachCell((cell, x, y) => {
      if (cell.isDirt()) {
        count += cell.getOriginalValue();
      }
    });
    return count;
  }

  /**
   * @return {number} The number of collectibles collected
   */
  getTotalCollected() {
    let count = 0;
    this.maze_.map.forEachCell((cell, x, y) => {
      if (cell.isDirt()) {
        count += (cell.getOriginalValue() - cell.getCurrentValue());
      }
    });
    return count;
  }

  /**
   * @return {boolean} Has the user completed this level
   * @override
   */
  finished() {
    return false;
  }

  /**
   * Called after user's code has finished executing. Gives us a chance to
   * terminate with app-specific values, such as unchecked cloud/purple flowers.
   * @override
   */
  onExecutionFinish() {
    const executionInfo = this.maze_.executionInfo;

    if (this.getTotalCollected() === 0) {
      executionInfo.terminateWithValue(COLLECTED_NOTHING);
    } else if (this.collectedTooMany()) {
      executionInfo.terminateWithValue(COLLECTED_TOO_MANY);
    } else if (this.studioApp_.feedback_.getNumCountableBlocks() > this.maxBlocks_) {
      executionInfo.terminateWithValue(TOO_MANY_BLOCKS);
    } else if (this.collectedAll()) {
      executionInfo.terminateWithValue(COLLECTED_EVERYTHING);
    } else {
      executionInfo.terminateWithValue(COLLECTED_SOME);
    }
  }

  /**
   * @override
   */
  hasMessage(testResults) {
    return true;
  }

  /**
   * Get any app-specific message, based on the termination value,
   * or return null if none applies.
   * @return {string|null} message
   * @override
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case TOO_MANY_BLOCKS:
        return mazeMsg.collectorTooManyBlocks({blockLimit: this.maxBlocks_});
      case COLLECTED_NOTHING:
        return mazeMsg.collectorCollectedNothing();
      case COLLECTED_SOME:
        return mazeMsg.collectorCollectedSome({count: this.getTotalCollected()});
      case COLLECTED_EVERYTHING:
        return mazeMsg.collectorCollectedEverything({count: this.getPotentialMaxCollected()});
      case COLLECTED_TOO_MANY:
        return mazeMsg.collectorCollectedTooMany();
      default:
        return null;
    }
  }

  /**
   * Get the test results based on the termination value.  If there is
   * no app-specific failure, this returns StudioApp.getTestResults().
   * @return {number} testResult
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case TOO_MANY_BLOCKS:
      case COLLECTED_NOTHING:
      case COLLECTED_TOO_MANY:
        return TestResults.APP_SPECIFIC_FAIL;
      case COLLECTED_SOME:
        return TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
      case COLLECTED_EVERYTHING:
        return TestResults.ALL_PASS;
    }

    return this.studioApp_.getTestResults(false);
  }

  /**
   * @override
   */
  getEmptyTile() {
    return 'null0';
  }
}
