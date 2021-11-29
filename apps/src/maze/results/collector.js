const studioApp = require('../../StudioApp').singleton;

import ResultsHandler from './resultsHandler';
import {TestResults} from '../../constants.js';
const getStore = require('../../redux').getStore;

import experiments from '@cdo/apps/util/experiments';
import mazeMsg from '../locale';

import {
  setCollectorMinRequired,
  resetCollectorCurrentCollected,
  setCollectorCurrentCollected
} from '../redux';

const TOO_MANY_BLOCKS = 0;
const COLLECTED_NOTHING = 1;
const COLLECTED_TOO_MANY = 4;
const COLLECTED_NOT_ENOUGH = 5;
const COLLECTED_ENOUGH_BUT_NOT_ALL = 6;

export default class CollectorHandler extends ResultsHandler {
  constructor(maze, config) {
    super(maze, config);

    // Collector level types treat the "ideal" block count as a hard
    // requirement
    this.maxBlocks_ = config.level.ideal;

    this.minCollected_ = config.level.minCollected;

    this.store_ = getStore();

    this.store_.dispatch(setCollectorMinRequired(this.minCollected_));

    // Initialize subtype-specific event listeners

    this.maze_.subtype.on('reset', () => {
      this.store_.dispatch(resetCollectorCurrentCollected());
    });

    this.maze_.subtype.on('collected', totalCollected => {
      this.store_.dispatch(setCollectorCurrentCollected(totalCollected));
    });

    this.maze_.subtype.on('collectedTooMany', () => {
      this.executionInfo.terminateWithValue(COLLECTED_TOO_MANY);
    });
  }

  /**
   * @return {boolean} Did the user try to collect too many things from
   * a space?
   */
  collectedTooMany() {
    let tooMany = false;
    this.maze_.map.forEachCell((cell, x, y) => {
      if (
        cell.isDirt() &&
        (cell.getCurrentValue() < 0 || isNaN(cell.getCurrentValue()))
      ) {
        tooMany = true;
      }
    });
    return tooMany;
  }

  /**
   * @return {boolean} Has the user collected all available collectibles?
   */
  collectedAll() {
    return (
      this.maze_.subtype.getTotalCollected() === this.getPotentialMaxCollected()
    );
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
   * @return {number} The number of collectibles collected, either currently or
   *         on the previous run (persists through resets)
   */
  getLastTotalCollected() {
    return this.store_.getState().maze.collectorLastCollected;
  }

  /**
   * @override
   */
  succeeded() {
    const usedFewEnoughBlocks =
      studioApp().feedback_.getNumCountableBlocks() <= this.maxBlocks_;

    return this.collectedAll() && usedFewEnoughBlocks;
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

    if (this.maze_.subtype.getTotalCollected() === 0) {
      executionInfo.terminateWithValue(COLLECTED_NOTHING);
    } else if (this.collectedTooMany()) {
      executionInfo.terminateWithValue(COLLECTED_TOO_MANY);
    } else if (
      studioApp().feedback_.getNumCountableBlocks() > this.maxBlocks_
    ) {
      executionInfo.terminateWithValue(TOO_MANY_BLOCKS);
    } else if (
      this.minCollected_ &&
      this.maze_.subtype.getTotalCollected() < this.minCollected_
    ) {
      executionInfo.terminateWithValue(COLLECTED_NOT_ENOUGH);
    } else if (!this.collectedAll()) {
      executionInfo.terminateWithValue(COLLECTED_ENOUGH_BUT_NOT_ALL);
    } else {
      executionInfo.terminateWithValue(true);
    }
  }

  /**
   * @override
   */
  hasMessage(testResults) {
    return true;
  }

  /**
   * @override
   */
  getMessage(terminationValue) {
    switch (terminationValue) {
      case TOO_MANY_BLOCKS:
        return mazeMsg.collectorTooManyBlocks({blockLimit: this.maxBlocks_});
      case COLLECTED_NOTHING:
        return mazeMsg.collectorCollectedNothing();
      case COLLECTED_TOO_MANY:
        return mazeMsg.collectorCollectedTooMany();
      case COLLECTED_NOT_ENOUGH:
        return mazeMsg.collectorCollectedNotEnough({goal: this.minCollected_});
      case COLLECTED_ENOUGH_BUT_NOT_ALL:
        return mazeMsg.collectorCollectedSome({
          count: this.getLastTotalCollected()
        });
      case true:
        // Remove this case when we turn the bubble dialog on for everyone
        if (!experiments.isEnabled(experiments.BUBBLE_DIALOG)) {
          return mazeMsg.collectorCollectedEverything({
            count: this.getPotentialMaxCollected()
          });
        } else {
          return super.getMessage(terminationValue);
        }
      default:
        return super.getMessage(terminationValue);
    }
  }

  /**
   * @override
   */
  getTestResults(terminationValue) {
    switch (terminationValue) {
      case TOO_MANY_BLOCKS:
      case COLLECTED_NOTHING:
      case COLLECTED_TOO_MANY:
      case COLLECTED_NOT_ENOUGH:
        return TestResults.APP_SPECIFIC_FAIL;
      case COLLECTED_ENOUGH_BUT_NOT_ALL:
        return TestResults.APP_SPECIFIC_IMPERFECT_PASS;
      case true:
        return TestResults.ALL_PASS;
    }

    return super.getTestResults(terminationValue);
  }

  /**
   * Only show the feedback dialog for a perfect pass; otherwise, we keep the
   * user on the page and let them iterate.
   *
   * @override
   */
  shouldPreventFeedbackDialog(feedbackType) {
    if (feedbackType === TestResults.ALL_PASS) {
      return false;
    }

    return true;
  }
}
