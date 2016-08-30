/**
 * A set of utility functions made for dealing with activities easier.
 */

import { makeEnum } from '@cdo/apps/utils';

/**
 * See ActivityConstants.
 */
const MINIMUM_PASS_RESULT = 20;
const MINIMUM_OPTIMAL_RESULT = 30;
export const SUBMITTED_RESULT = 1000;
export const LOCKED_RESULT = 1001;
const REVIEW_REJECTED_RESULT = 1500;
const REVIEW_ACCEPTED_RESULT = 2000;

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
  'review_rejected'
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
  if (result === REVIEW_ACCEPTED_RESULT) {
    return 'review_accepted';
  }
  if (result === REVIEW_REJECTED_RESULT) {
    return 'review_rejected';
  }
  if (result === SUBMITTED_RESULT) {
    return LevelStatus.submitted;
  }
  if (result === LOCKED_RESULT) {
    return LevelStatus.locked;
  }
  if (result >= MINIMUM_OPTIMAL_RESULT) {
    return LevelStatus.perfect;
  }
  if (result >= MINIMUM_PASS_RESULT) {
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
