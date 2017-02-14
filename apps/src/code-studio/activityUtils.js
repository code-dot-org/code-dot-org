/**
 * A set of utility functions made for dealing with activities easier.
 */

import { makeEnum } from '@cdo/apps/utils';

import { TestResults } from '@cdo/apps/constants';

/**
 * Different possibilites for level.status. Note, these values are also used
 * in dashboard in various places and should not be changed.
 */
export const LevelStatus = makeEnum(
  'not_tried',
  'submitted',
  'locked',
  'perfect',
  'passed',
  'attempted',
  'review_accepted',
  'review_rejected',
  'dots_disabled'
);

export const LevelKind = makeEnum(
  'peer_review',
  'assessment',
  'puzzle',
  'unplugged',
  'level'
);

/**
 * See ApplicationHelper#activity_css_class.
 * @param result
 * @return {string}
 */
export const activityCssClass = result => {
  if (!result) {
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
  if (result === TestResults.LOCKED_RESULT) {
    return LevelStatus.locked;
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
