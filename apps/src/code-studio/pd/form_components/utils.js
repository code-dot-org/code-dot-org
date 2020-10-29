module.exports = {};

/**
 * The most standard kind of answer, simply provides for a way to specify the
 * display text and form value individually
 * @typedef Answer
 * @type {object}
 * @property {string} answerText - the display text of the answer; used to
 *     label the input
 * @property {string} [answerValue] - the form value of the answer; used in the
 *     "value" attribute of the input. Defaults to 'answerText' if undefined.
 */

/**
 * The most basic kind of answer, used for those situations where the display
 * text and form value are identical.
 * @typedef SimpleAnswer
 * @type {string}
 */

/**
 * A complex kind of answer which will add an additional input element to
 * existing form elements. Most commonly used to add a text input to the
 * "other" option in a radio input.
 *
 * Notably, this kind does not include an "answerValue" property; the value of
 * this input is expected to come from the additional input.
 *
 * @typedef ExtraInputAnswer
 * @type {object}
 * @property {string} answerText - the display text of the answer; used to
 *     label the input
 * @property {string} inputId - the value to assign to the "id" param of the
 *     additional input element.
 * @property {string} [inputValue] - the form value to assign to the "value"
 *     attribute of the additional input element.
 * @property {function} [onChange] - an optional listener to assign to the
 *     "onChange" attribute of the additional input element.
 */

/**
 * Simple utility to normalize either Answers or SimpleAnswers to just Answers.
 * @param {(Answer|SimpleAnswer)} answer
 * @returns {(Answer)}
 */
module.exports.normalizeAnswer = answer => {
  const answerText = typeof answer === 'string' ? answer : answer.answerText;
  const answerValue =
    typeof answer === 'string' ? answer : answer.answerValue || answerText;
  return {answerText, answerValue};
};
