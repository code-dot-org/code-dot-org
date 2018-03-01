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
import { TestResults } from './constants';
import {
  tryGetSessionStorage,
  trySetSessionStorage,
  showGenericQtip,
  createEvent,
} from './utils';
import msg from '@cdo/locale';

const ONETIME_HINT_PROMPT_SEEN_LEVELS = 'hint_prompt_seen_levels';

export default class AuthoredHints {
  constructor(studioApp) {
    this.studioApp_ = studioApp;

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
    return getStore().getState().authoredHints.unseenHints;
  }

  /**
   * @return {AuthoredHints[]}
   */
  getSeenHints() {
    return getStore().getState().authoredHints.seenHints;
  }

  /**
   * Creates contextual hints for the specified blocks and adds them to
   * the queue of hints to display. Triggers an animation on the hint
   * lightbulb if the queue has changed.
   * @param {BlockHint[]} blocks {@see authoredHintUtils.createContextualHintsFromBlocks}
   */
  displayMissingBlockHints(blocks) {
    const newContextualHints = authoredHintUtils.createContextualHintsFromBlocks(blocks);
    getStore().dispatch(displayMissingBlockHints(newContextualHints));

    if (newContextualHints.length > 0 && this.getUnseenHints().length > 0) {
      getStore().dispatch(setHasAuthoredHints(true));
    }
  }

  /**
   * @param {LiveMilestoneResponse} response
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
      getStore().dispatch(enqueueHints(hints, hintsUsedIds));
      getStore().dispatch(setHasAuthoredHints(true));
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

    // Notify game types that implement the `displayHintPath` listener to draw
    // hint paths in the visualization area.
    if (hint.hintPath && hint.hintPath.length) {
      const event = createEvent('displayHintPath');
      event.detail = hint.hintPath;
      window.dispatchEvent(event);
    }

    return hint;
  }

  /**
   * Mostly a passthrough to authoredHintUtils.recordUnfinishedHint. Also
   * marks the given hint as seen.
   * @param {AuthoredHint} hint
   */
  recordUserViewedHint_(hint) {
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
  }

  /**
   * Get the set of level ids for which the onetime hint prompt has already been
   * seen this session
   *
   * @returns {number[]}
   */
  getOnetimeHintPromptSeenLevelIds() {
    // default to a JSONified empty array if undefined or on error
    const defaultValue = '[]';
    const sessionValue = tryGetSessionStorage(
      ONETIME_HINT_PROMPT_SEEN_LEVELS,
      defaultValue,
    );
    return JSON.parse(sessionValue || defaultValue);
  }

  /**
   * @returns {boolean} whether or not the onetime hint prompt has already been
   *          seen this level this session
   */
  onetimeHintPromptSeenThisLevel() {
    const thisLevel = this.levelId_;
    const seenLevels = this.getOnetimeHintPromptSeenLevelIds();
    return seenLevels.includes(thisLevel);
  }

  /**
   * Method to determine whether or not the user should be shown the onetime
   * just-in-time hint prompt suggesting that they use a hint for this level.
   *
   * Users will see the hint prompt after their program finishes executing if:
   * - They have not passed or perfected the puzzle,
   * - And there are one or more hints available in the hint well,
   * - And they have not seen the hint prompt on this puzzle in the current session,
   * - And they have not used a hint on this puzzle yet,
   * - And their total number of runs on this puzzle exceeds the run threshold.
   *
   * @returns {boolean}
   */
  shouldShowOnetimeHintPrompt() {
    const puzzleUnpassed =
      this.studioApp_.lastTestResult < TestResults.MINIMUM_PASS_RESULT;
    const hintsAvailable = this.getUnseenHints().length > 0;
    const notSeenHintPromptThisLevel = !this.onetimeHintPromptSeenThisLevel();
    const noHintsViewed = this.getSeenHints().length === 0;
    const runsOverThreshold =
      this.studioApp_.attempts >=
      this.studioApp_.config.level.hintPromptAttemptsThreshold;

    return (
      puzzleUnpassed &&
      hintsAvailable &&
      notSeenHintPromptThisLevel &&
      noHintsViewed &&
      runsOverThreshold
    );
  }

  considerShowingOnetimeHintPrompt() {
    if (this.shouldShowOnetimeHintPrompt()) {
      this.showOnetimeHintPrompt();
    }
  }

  showOnetimeHintPrompt() {
    // mark prompt as having been seen for this level
    const seenLevels = this.getOnetimeHintPromptSeenLevelIds();
    seenLevels.push(this.levelId_);
    trySetSessionStorage(ONETIME_HINT_PROMPT_SEEN_LEVELS, JSON.stringify(seenLevels));

    // show prompt
    const title = msg.onetimeHintPromptTitle();
    const message = msg.onetimeHintPromptMessage();
    const position = {
      my: "top left",
      at: "bottom right"
    };
    showGenericQtip("#lightbulb", title, message, position);
  }
}
