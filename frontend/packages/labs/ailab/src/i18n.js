import uiStrings from './i18n/ailab.json';
import MessageFormat from 'messageformat'

let messages;

const initI18n = (i18n = {}) => {
  // For now, use English pluralization rules.
  const mf = new MessageFormat('en');
  messages = {...mf.compile(uiStrings), ...i18n};
};

const t = (key, options) => {
  if (!messages) {
    throw "I18n must be initialized before calling t";
  }
  // The default value to return if no string is found for the given key
  const defaultValue = options["default"];

  const scope = options["scope"] || [];
  let scopedMessages = messages;
  scope.forEach(s => {
    if (scopedMessages !== undefined) {
      scopedMessages = scopedMessages[s]
    }
  });

  if (scopedMessages === undefined) {
    console.warn("Couldn't find string for given key", key, options, scopedMessages);
    return defaultValue;
  }

  // All strings should be represented by a Function. If it isn't, the scope probaly needs to be
  // defined.
  if (!(scopedMessages[key] instanceof Function)) {
    console.warn("Given key doesn't point to a single string", key, options, scopedMessages);
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
