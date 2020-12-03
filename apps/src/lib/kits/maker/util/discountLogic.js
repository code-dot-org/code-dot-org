/**
 * @file Consolidates business logic for discount code eligibility into pure functions.
 */
import moment from 'moment';

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

/**
 * @enum {Date} Date when teachers become eligible for discounts
 *   conditional on their responses to the Unit 6 question.
 */
export const eligibilityDates = {
  [Unit6Intention.YES_FALL_2020]: moment('2020-07-01'),
  [Unit6Intention.YES_SPRING_2021]: moment('2020-11-01')
};

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
  const today = moment();

  if (Unit6Intention.YES_SPRING_2020 === unit6Intention) {
    return true;
  } else if (
    Unit6Intention.YES_FALL_2020 === unit6Intention &&
    today > eligibilityDates[Unit6Intention.YES_FALL_2020]
  ) {
    return true;
  } else if (
    Unit6Intention.YES_SPRING_2021 === unit6Intention &&
    today > eligibilityDates[Unit6Intention.YES_SPRING_2021]
  ) {
    return true;
  } else {
    return false;
  }
}
