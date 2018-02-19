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
import experiments from '@cdo/apps/util/experiments';
import mazeMsg from './locale';

import {getStore} from '../redux';
import {
  resetCollectorCurrentCollected,
  setCollectorCurrentCollected,
  setCollectorMinRequired,
} from './redux';

const TOO_MANY_BLOCKS = 0;
const COLLECTED_NOTHING = 1;
const COLLECTED_TOO_MANY = 4;
const COLLECTED_NOT_ENOUGH = 5;
const COLLECTED_ENOUGH_BUT_NOT_ALL = 6;

export default class Collector extends Subtype {
  constructor(maze, studioApp, config) {
    super(maze, studioApp, config);

    // Collector level types treat the "ideal" block count as a hard
    // requirement
    this.maxBlocks_ = config.level.ideal;

    this.minCollected_ = config.level.minCollected;
    this.store_ = getStore();

    this.store_.dispatch(setCollectorMinRequired(this.minCollected_));
  }

  reset() {
    this.store_.dispatch(resetCollectorCurrentCollected());
  }

  scheduleDirtChange(row, col) {
    super.scheduleDirtChange(row, col);

    // Play one of our various collect sounds, looping through them
    if (this.collectSoundsCount) {
      this.collectSoundsI = this.collectSoundsI || 0;
      this.playAudio_('collect' + this.collectSoundsI);
      this.collectSoundsI += 1;
      this.collectSoundsI %= this.collectSoundsCount;
    }

    this.store_.dispatch(setCollectorCurrentCollected(this.getTotalCollected()));
  }

  /**
   * @override
   */
  isCollector() {
    return true;
  }

  collect(id, row, col) {
    const currVal = this.maze_.map.getValue(row, col);
    if (currVal === undefined || currVal < 1) {
      this.maze_.executionInfo.terminateWithValue(COLLECTED_TOO_MANY);
    } else {
      this.maze_.executionInfo.queueAction('pickup', id);
      this.maze_.map.setValue(row, col, currVal - 1);
    }
  }

  /**
   * @override
   */
  loadAudio(skin) {
    if (skin.collectSounds) {
      this.collectSoundsCount = skin.collectSounds.length;
      skin.collectSounds.forEach((sound, i) => {
        this.studioApp_.loadAudio(sound, 'collect' + i);
      });
    }
  }

  /**
   * @override
   */
  createDrawer(svg) {
    this.drawer = new CollectorDrawer(this.maze_.map, this.skin_.goal, svg);
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
   * @return {number} The number of collectibles collected, either currently or
   *         on the previous run (persists through resets)
   */
  getLastTotalCollected() {
    return this.store_.getState().maze.collectorLastCollected;
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
   * @override
   */
  succeeded() {
    const usedFewEnoughBlocks =
      this.studioApp_.feedback_.getNumCountableBlocks() <= this.maxBlocks_;

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
    const executionInfo = this.maze_.executionInfo;

    if (this.getTotalCollected() === 0) {
      executionInfo.terminateWithValue(COLLECTED_NOTHING);
    } else if (this.collectedTooMany()) {
      executionInfo.terminateWithValue(COLLECTED_TOO_MANY);
    } else if (this.studioApp_.feedback_.getNumCountableBlocks() > this.maxBlocks_) {
      executionInfo.terminateWithValue(TOO_MANY_BLOCKS);
    } else if (this.minCollected_ && this.getTotalCollected() < this.minCollected_) {
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
        return mazeMsg.collectorTooManyBlocks({ blockLimit: this.maxBlocks_ });
      case COLLECTED_NOTHING:
        return mazeMsg.collectorCollectedNothing();
      case COLLECTED_TOO_MANY:
        return mazeMsg.collectorCollectedTooMany();
      case COLLECTED_NOT_ENOUGH:
        return mazeMsg.collectorCollectedNotEnough({ goal: this.minCollected_ });
      case COLLECTED_ENOUGH_BUT_NOT_ALL:
        return mazeMsg.collectorCollectedSome({
          count: this.getLastTotalCollected(),
        });
      case true:
        // Remove this case when we turn the bubble dialog on for everyone
        if (!experiments.isEnabled('bubbleDialog')) {
          return mazeMsg.collectorCollectedEverything({
            count: this.getPotentialMaxCollected(),
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
        return TestResults.APP_SPECIFIC_ACCEPTABLE_FAIL;
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

  /**
   * @override
   */
  getEmptyTile() {
    return 'null0';
  }

  /**
   * @override
   */
  drawTile(svg, tileSheetLocation, row, col, tileId) {
    super.drawTile(svg, tileSheetLocation, row, col, tileId);
    this.drawCorners(svg, row, col, tileId);
  }

  drawCorners(svg, row, col, tileId) {
    const corners = {
      'NE': [1, -1],
      'NW': [-1, -1],
      'SE': [1, 1],
      'SW': [-1, 1],
    };

    const SVG_NS = 'http://www.w3.org/2000/svg';
    const SQUARE_SIZE = 50;

    const pegmanElement = svg.getElementsByClassName('pegman-location')[0];

    if (!this.isWallOrOutOfBounds_(col, row)) {
      Object.keys(corners).filter(corner => {
        // we need a corner if there is a wall in the corner direction and open
        // space in the two cardinal directions "surrounding" the corner
        const direction = corners[corner];
        const needsCorner = !this.isWallOrOutOfBounds_(col + direction[0], row) &&
            !this.isWallOrOutOfBounds_(col, row + direction[1]) &&
            this.isWallOrOutOfBounds_(col + direction[0], row + direction[1]);

        return needsCorner;
      }).forEach(corner => {
        const tileClip = document.createElementNS(SVG_NS, 'clipPath');
        tileClip.setAttribute('id', `tileCorner${corner}ClipPath${tileId}`);
        const tileClipRect = document.createElementNS(SVG_NS, 'rect');
        tileClipRect.setAttribute('width', SQUARE_SIZE / 2);
        tileClipRect.setAttribute('height', SQUARE_SIZE / 2);

        // clip the asest to only the quadrant we care about
        const direction = corners[corner];
        tileClipRect.setAttribute('x', col * SQUARE_SIZE + (direction[0] + 1) * SQUARE_SIZE / 4);
        tileClipRect.setAttribute('y', row * SQUARE_SIZE + (direction[1] + 1) * SQUARE_SIZE / 4);
        tileClip.appendChild(tileClipRect);
        svg.appendChild(tileClip);

        // Create image.
        const img = document.createElementNS(SVG_NS, 'image');
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', this.skin_.corners);
        img.setAttribute('height', SQUARE_SIZE);
        img.setAttribute('width', SQUARE_SIZE);
        img.setAttribute('x', SQUARE_SIZE * col);
        img.setAttribute('y', SQUARE_SIZE * row);
        img.setAttribute('id', `tileCorner${corner}${tileId}`);
        img.setAttribute('clip-path', `url(#${tileClip.id})`);
        svg.insertBefore(img, pegmanElement);
      });
    }
  }
}
