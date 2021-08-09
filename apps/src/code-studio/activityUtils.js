/**
 * A set of utility functions made for dealing with activities easier.
 */

import {TestResults} from '@cdo/apps/constants';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

/**
 * See ApplicationHelper#activity_css_class.
 * @param result
 * @return {string}
 */
export const activityCssClass = result => {
  if (!result || result === TestResults.NO_TESTS_RUN) {
    return LevelStatus.not_tried;
  }
  if (result === TestResults.REVIEW_ACCEPTED_RESULT) {
    return LevelStatus.review_accepted;
  }
  if (result === TestResults.REVIEW_REJECTED_RESULT) {
    return LevelStatus.review_rejected;
  }
  if (result === TestResults.SUBMITTED_RESULT) {
    return LevelStatus.submitted;
  }
  if (result >= TestResults.MINIMUM_OPTIMAL_RESULT) {
    return LevelStatus.perfect;
  }
  if (result >= TestResults.MINIMUM_PASS_RESULT) {
    return LevelStatus.passed;
  }
  return LevelStatus.attempted;
};

/**
 * Inverse of the above function.
 * Given a status string, returns a result value.
 * @param {string} status
 * @return {number}
 */
export const resultFromStatus = status => {
  if (status === LevelStatus.review_accepted) {
    return TestResults.REVIEW_ACCEPTED_RESULT;
  }
  if (status === LevelStatus.review_rejected) {
    return TestResults.REVIEW_REJECTED_RESULT;
  }
  if (status === LevelStatus.submitted) {
    return TestResults.SUBMITTED_RESULT;
  }
  if (status === LevelStatus.free_play_complete) {
    return TestResults.FREE_PLAY;
  }
  if (status === LevelStatus.perfect) {
    return TestResults.ALL_PASS;
  }
  if (status === LevelStatus.passed) {
    return TestResults.MINIMUM_PASS_RESULT;
  }
  return TestResults.NO_TESTS_RUN;
};

/**
 * Returns the "best" of the two results, as defined in apps/src/constants.js.
 * Note that there are negative results that count as an attempt, so we can't
 * just take the maximum.
 * @param {Number} a
 * @param {Number} b
 * @return {Number} The better result.
 */
export const mergeActivityResult = (a, b) => {
  a = a || 0;
  b = b || 0;
  if (a === 0) {
    return b;
  }
  if (b === 0) {
    return a;
  }
  return Math.max(a, b);
};
