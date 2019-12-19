import data from '../../i18n/oceans.json';
import MessageFormat from 'messageformat'

let messages;
export const init = (i18n = {}) => {
  // For now, use English pluralization rules.
  const mf = new MessageFormat('en');
  messages = {...mf.compile(data), ...i18n};
};

export const t = (key, options) => {
  if (!messages) {
    throw "I18n must be initialized before calling t";
  }
  return messages[key](options);
};
