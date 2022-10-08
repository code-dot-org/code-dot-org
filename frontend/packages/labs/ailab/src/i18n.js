import data from './i18n/ailab.json';
import MessageFormat from 'messageformat'

let messages;

const initI18n = (i18n = {}) => {
  // For now, use English pluralization rules.
  const mf = new MessageFormat('en');
  messages = {...mf.compile(data), ...i18n};
};

const t = (key, options) => {
  if (!messages) {
    throw "I18n must be initialized before calling t";
  }
  return messages[key](options);
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
