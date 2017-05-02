/**
 * @overview helper class to manage the state of the Authored Hint UI.
 * Used exclusively by StudioApp.
 */

var authoredHintUtils = require('./authoredHintUtils');
import {getStore} from './redux';
import { setHasAuthoredHints } from './redux/instructions';
import {
  enqueueHints,
  showNextHint,
  displayMissingBlockHints
} from './redux/authoredHints';

var AuthoredHints = function (studioApp) {
  this.studioApp_ = studioApp;

  /**
   * @type {number}
   */
  this.scriptId_ = undefined;

  /**
   * @type {number}
   */
  this.levelId_ = undefined;
};

module.exports = AuthoredHints;

/**
 * @return {AuthoredHints[]}
 */
AuthoredHints.prototype.getUnseenHints = function () {
  return getStore().getState().authoredHints.unseenHints;
};

/**
 * @return {AuthoredHints[]}
 */
AuthoredHints.prototype.getSeenHints = function () {
  return getStore().getState().authoredHints.seenHints;
};

/**
 * Creates contextual hints for the specified blocks and adds them to
 * the queue of hints to display. Triggers an animation on the hint
 * lightbulb if the queue has changed.
 * @param {Object[]} blocks @see authoredHintUtils.createContextualHintsFromBlocks
 */
AuthoredHints.prototype.displayMissingBlockHints = function (blocks) {
  var newContextualHints = authoredHintUtils.createContextualHintsFromBlocks(blocks);
  getStore().dispatch(displayMissingBlockHints(newContextualHints));

  if (newContextualHints.length > 0 && this.getUnseenHints().length > 0) {
    getStore().dispatch(setHasAuthoredHints(true));
  }
};

/**
 * @param {Object} response
 */
AuthoredHints.prototype.finishHints = function (response) {
  authoredHintUtils.finishHints({
    time: ((new Date().getTime()) - this.studioApp_.initTime),
    attempt: this.studioApp_.attempts,
    testResult: this.studioApp_.lastTestResult,
    activityId: response && response.activity_id,
    levelSourceId: response && response.level_source_id,
  });
};

/**
 * @param {string} url
 */
AuthoredHints.prototype.submitHints = function (url) {
  authoredHintUtils.submitHints(url);
};

/**
 * @param {AuthoredHint[]} hints
 * @param {String[]} hintsUsedIds
 * @param {number} scriptId
 * @param {number} levelId
 */
AuthoredHints.prototype.init = function (hints, hintsUsedIds, scriptId, levelId) {
  this.scriptId_ = scriptId;
  this.levelId_ = levelId;

  if (hints && hints.length > 0) {
    getStore().dispatch(enqueueHints(hints, hintsUsedIds));
    getStore().dispatch(setHasAuthoredHints(true));
  }
};

AuthoredHints.prototype.showNextHint = function () {
  if (this.getUnseenHints().length === 0) {
    return;
  }
  const hint = this.getUnseenHints()[0];
  this.recordUserViewedHint_(hint);
  return hint;
};

/**
 * Mostly a passthrough to authoredHintUtils.recordUnfinishedHint. Also
 * marks the given hint as seen.
 * @param {AuthoredHint} hint
 */
AuthoredHints.prototype.recordUserViewedHint_ = function (hint) {
  getStore().dispatch(showNextHint(hint));
  authoredHintUtils.recordUnfinishedHint({
    // level info
    scriptId: this.scriptId_,
    levelId: this.levelId_,

    // hint info
    hintId: hint.hintId,
    hintClass: hint.hintClass,
    hintType: hint.hintType,
  });
};
