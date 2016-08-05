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

import mazeMsg from './locale';
import tiles from './tiles';

const TOO_MANY_BLOCKS = 0;
const COLLECTED_NOTHING = 1;
const COLLECTED_SOME = 2;
const COLLECTED_EVERYTHING = 3;

export default class Collector {
  constructor(maze, studioApp, config) {
    this.maze_ = maze;
    this.studioApp_ = studioApp;
    this.skin_ = config.skin;

    // Collector level types treat the "ideal" block count as a hard
    // requirement
    this.maxBlocks_ = config.level.ideal;
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
   */
  finished() {
    return this.getTotalCollected() > 0 &&
        this.studioApp_.feedback_.getNumCountableBlocks() <= this.maxBlocks_;
  }

  /**
   * Called after user's code has finished executing. Gives us a chance to
   * terminate with app-specific values, such as unchecked cloud/purple flowers.
   */
  onExecutionFinish() {
    const executionInfo = this.maze_.executionInfo;

    if (this.getTotalCollected() === 0) {
      executionInfo.terminateWithValue(COLLECTED_NOTHING);
    } else if (this.studioApp_.feedback_.getNumCountableBlocks() > this.maxBlocks_) {
      executionInfo.terminateWithValue(TOO_MANY_BLOCKS);
    } else if (this.collectedAll()) {
      executionInfo.terminateWithValue(COLLECTED_EVERYTHING);
    } else {
      executionInfo.terminateWithValue(COLLECTED_SOME);
    }
  }

  /**
   * Get any app-specific message, based on the termination value,
   * or return null if none applies.
   * @return {string|null} message
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
      default:
        return null;
    }
  }

  /**
   * Get the test results based on the termination value.  If there is
   * no app-specific failure, this returns StudioApp.getTestResults().
   * @return {number} testResult
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case TOO_MANY_BLOCKS:
      case COLLECTED_NOTHING:
        return TestResults.APP_SPECIFIC_FAIL;
      case COLLECTED_SOME:
        return TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
      case COLLECTED_EVERYTHING:
        return TestResults.ALL_PASS;
    }

    return this.studioApp_.getTestResults(false);
  }
}
