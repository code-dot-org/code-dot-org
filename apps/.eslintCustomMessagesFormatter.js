/**
 * An eslint formatter which extends the default formatter to customize the
 * messages for certain rules.
 *
 * @see https://eslint.org/docs/latest/extend/custom-formatters
 */

const {ESLint} = require('eslint');
const eslint = new ESLint();

/**
 * Provide a mapping from eslint ruleId to the override for that rule. Right
 * now, that override should be a function which takes as an argument an eslint
 * message object and returns a string which will be used as the new message.
 *
 * This could easily be updated in the future to map to either a function or a
 * string.
 *
 * @see https://eslint.org/docs/latest/extend/custom-formatters#the-message-object
 * @type {Object.<string, function>}
 */
const RULE_MESSAGE_OVERRIDES = {
  // for 'dangerouslySetInnerHTML' warnings, suggest our custom SafeMarkdown
  // component as an alternative and include the original error message for
  // clarity.
  'react/no-danger': messageObject =>
    `${
      messageObject.message
    }. Please use the SafeMarkdown React Component instead if possible.`
};

/**
 * Format eslint results with custom messages
 *
 * @param results - https://eslint.org/docs/latest/extend/custom-formatters#the-result-object
 * @returns {string}
 */
module.exports = async (results = []) => {
  // first, preprocess results to adjust messages as desired
  results.forEach(result => {
    result.messages.forEach(messageObject => {
      const override = RULE_MESSAGE_OVERRIDES[messageObject.ruleId];
      if (override) {
        messageObject.message = override(messageObject);
      }
    });
  });

  // then pass modified results array to the existing formatter
  const defaultFormatter = await eslint.loadFormatter();
  return defaultFormatter.format(results);
};
