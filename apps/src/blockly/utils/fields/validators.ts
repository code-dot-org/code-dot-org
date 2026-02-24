/**
 * Ensure that only a number may be entered.
 * @param {string} text The user's text.
 * @returns {?string} A string representing a valid number, or null if invalid.
 *   Returns 0 for null or empty string.
 * @static
 */
export function numberValidator(text: string): string | null {
  if ((Blockly.isStartMode || Blockly.isToolboxMode) && text === '???') {
    return text;
  }
  text = text || '';
  // TODO: Handle cases like 'ten', '1.203,14', etc.
  // 'O' is sometimes mistaken for '0' by inexperienced users.
  text = text.replace(/O/gi, '0');
  // Strip out thousands separators.
  text = text.replace(/,/g, '');
  const n = parseFloat(text || '0');
  return isNaN(n) ? null : String(n);
}

/**
 * Ensure that only a nonnegative integer may be entered.
 * @param {string} text The user's text.
 * @returns {?string} A string representing a valid int, or null if invalid.
 *   Returns '0' for negative numbers and null for truthy strings that do not contain numbers.
 * @static
 */
export function nonnegativeIntegerValidator(text: string): string | null {
  if ((Blockly.isStartMode || Blockly.isToolboxMode) && text === '???') {
    return text;
  }
  const n = numberValidator(text);
  if (n) {
    return String(Math.max(0, Math.floor(parseFloat(n))));
  }
  return n;
}
