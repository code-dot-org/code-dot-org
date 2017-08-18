/**
 * @overview helper class to manage the state of the Authored Hint UI.
 * Used exclusively by StudioApp.
 */

import authoredHintUtils from './authoredHintUtils';
import { getStore } from './redux';
import { setHasAuthoredHints } from './redux/instructions';
import {
  enqueueHints,
  showNextHint,
  displayMissingBlockHints
} from './redux/authoredHints';

export default class AuthoredHints {
  constructor(studioApp) {
    this.studioApp_ = studioApp;
    this.store_ = getStore();

    /**
     * @type {number}
     */
    this.scriptId_ = undefined;

    /**
     * @type {number}
     */
    this.levelId_ = undefined;
  }

  /**
   * @return {AuthoredHints[]}
   */
  getUnseenHints() {
    return this.store_.getState().authoredHints.unseenHints;
  }

  /**
   * @return {AuthoredHints[]}
   */
  getSeenHints() {
    return this.store_.getState().authoredHints.seenHints;
  }

  /**
   * Creates contextual hints for the specified blocks and adds them to
   * the queue of hints to display. Triggers an animation on the hint
   * lightbulb if the queue has changed.
   * @param {Object[]} blocks @see authoredHintUtils.createContextualHintsFromBlocks
   */
  displayMissingBlockHints(blocks) {
    const newContextualHints = authoredHintUtils.createContextualHintsFromBlocks(blocks);
    this.store_.dispatch(displayMissingBlockHints(newContextualHints));

    if (newContextualHints.length > 0 && this.getUnseenHints().length > 0) {
      this.store_.dispatch(setHasAuthoredHints(true));
    }
  }

  /**
   * @param {Object} response
   */
  finishHints(response) {
    authoredHintUtils.finishHints({
      time: ((new Date().getTime()) - this.studioApp_.initTime),
      attempt: this.studioApp_.attempts,
      testResult: this.studioApp_.lastTestResult,
      activityId: response && response.activity_id,
      levelSourceId: response && response.level_source_id,
    });
  }

  /**
   * @param {string} url
   */
  submitHints(url) {
    authoredHintUtils.submitHints(url);
  }

  /**
   * @param {AuthoredHint[]} hints
   * @param {String[]} hintsUsedIds
   * @param {number} scriptId
   * @param {number} levelId
   */
  init(hints, hintsUsedIds, scriptId, levelId) {
    this.scriptId_ = scriptId;
    this.levelId_ = levelId;

    if (hints && hints.length > 0) {
      this.store_.dispatch(enqueueHints(hints, hintsUsedIds));
      this.store_.dispatch(setHasAuthoredHints(true));
    }
  }

  /**
   * @return {(AuthoredHint|undefined)} hint
   */
  showNextHint() {
    if (this.getUnseenHints().length === 0) {
      return;
    }
    const hint = this.getUnseenHints()[0];
    this.recordUserViewedHint_(hint);
    return hint;
  }

  /**
   * Mostly a passthrough to authoredHintUtils.recordUnfinishedHint. Also
   * marks the given hint as seen.
   * @param {AuthoredHint} hint
   */
  recordUserViewedHint_(hint) {
    this.store_.dispatch(showNextHint(hint));
    authoredHintUtils.recordUnfinishedHint({
      // level info
      scriptId: this.scriptId_,
      levelId: this.levelId_,

      // hint info
      hintId: hint.hintId,
      hintClass: hint.hintClass,
      hintType: hint.hintType,
    });
  }
}
