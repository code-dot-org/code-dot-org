import uiStrings from './i18n/ailab.json';
import MessageFormat from 'messageformat'

let messages;

const initI18n = (i18n = {}) => {
  // For now, use English pluralization rules.
  const mf = new MessageFormat('en');
  messages = {...mf.compile(uiStrings), ...i18n};
};

/**
 *
 * @param key {string} The ID of the translated string to return.
 * @param options {Object} Contains options for modifying the lookup of the string.
 * @param options["default"] {string} The string to return if no translation is found.
 * @param options["scope"] {string[]} If the key is in a nested structure, you must define the path
 * to it.
 * @returns {string} The translated string. undefined if not found.
 */
const t = (key, options = {}) => {
  if (!messages) {
    throw "I18n must be initialized before calling t";
  }
  // The default value to return if no string is found for the given key
  const defaultValue = options["default"];

  const scope = options["scope"] || [];
  let scopedMessages = messages;
  scope.forEach(s => {
    if (scopedMessages !== undefined) {
      scopedMessages = scopedMessages[s];
    }
  });

  if (scopedMessages === undefined) {
    return defaultValue;
  }

  // All strings should be represented by a Function. If it isn't, the scope probably needs to be
  // defined.
  if (!(scopedMessages[key] instanceof Function)) {
    return defaultValue;
  }

  return scopedMessages[key](options);
};

/*
  Used to reset the state to before it was initialized.
  This should only be used in tests.
 */
const reset = () => {
  messages = undefined;
}

export default {
  initI18n,
  t,
  reset
};
