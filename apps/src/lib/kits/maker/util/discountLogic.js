/**
 * @file Consolidates business logic for discount code eligibility into pure functions.
 */

/**
 * @enum {string} Possible answers to the Unit 6 question.
 */
export const Unit6Intention = {
  NO: 'no',
  YES_18_19: 'yes1819',
  YES_19_20: 'yes1920',
  YES_AFTER: 'yesAfter',
  UNSURE: 'unsure',
};

/**
 * @param {string} unit6Intention
 * @returns {boolean} True if the given answer to the unit 6 question contributes to the
 *   teacher's eligibility for a discount code.
 */
export function isUnit6IntentionEligible(unit6Intention) {
  return [Unit6Intention.YES_18_19, Unit6Intention.YES_19_20].includes(unit6Intention);
}
