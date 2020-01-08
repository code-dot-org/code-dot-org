/**
 * @file Consolidates business logic for discount code eligibility into pure functions.
 */

/**
 * @enum {string} Possible answers to the Unit 6 question.
 */
export const Unit6Intention = {
  NO: 'no',
  YES_SPRING_2020: 'yesSpring2020',
  YES_FALL_2020: 'yesFall2020',
  YES_SPRING_2021: 'yesSpring2021',
  UNSURE: 'unsure'
};

// Dates used to establish whether a user can redeem their discount code
export const fallEligibilityDate = new Date('2020-06-30');
export const springEligibilityDate = new Date('2020-10-31');
const today = new Date();

/**
 * @param {string} unit6Intention
 * @returns {boolean} True if the given answer to the unit 6 question contributes to the
 *   teacher's eligibility for a discount code.
 */
export function isUnit6IntentionEligible(unit6Intention) {
  return [
    Unit6Intention.YES_SPRING_2020,
    Unit6Intention.YES_FALL_2020,
    Unit6Intention.YES_SPRING_2021
  ].includes(unit6Intention);
}

/**
 * @param {string} unit6Intention
 * @returns {boolean} True if given answer to unit 6 question
 *   makes them eligible for a discount code, and the current
 *   date is after the opening of the eligibility window.
 */
export function inDiscountRedemptionWindow(unit6Intention) {
  if (Unit6Intention.YES_SPRING_2020 === unit6Intention) {
    return true;
  } else if (
    Unit6Intention.YES_FALL_2020 === unit6Intention &&
    today > fallEligibilityDate
  ) {
    return true;
  } else if (
    Unit6Intention.YES_SPRING_2021 === unit6Intention &&
    today > springEligibilityDate
  ) {
    return true;
  } else {
    return false;
  }
}
