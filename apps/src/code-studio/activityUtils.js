/**
 * A set of utility functions made for dealing with activities easier.
 */

/**
 * See ActivityConstants.
 */
const MINIMUM_PASS_RESULT = 20;
const MINIMUM_OPTIMAL_RESULT = 30;
export const SUBMITTED_RESULT = 1000;
const REVIEW_REJECTED_RESULT = 1500;
const REVIEW_ACCEPTED_RESULT = 2000;

/**
 * See ApplicationHelper#activity_css_class.
 * @param result
 * @return {string}
 */
export const activityCssClass = result => {
  if (!result) {
    return 'not_tried';
  }
  if (result === REVIEW_ACCEPTED_RESULT) {
    return 'perfect';
  }
  if (result === REVIEW_REJECTED_RESULT) {
    return 'review_rejected';
  }
  if (result === SUBMITTED_RESULT) {
    return 'submitted';
  }
  if (result >= MINIMUM_OPTIMAL_RESULT) {
    return 'perfect';
  }
  if (result >= MINIMUM_PASS_RESULT) {
    return 'passed';
  }
  return 'attempted';
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
