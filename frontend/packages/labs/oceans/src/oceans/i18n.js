import data from '../../i18n/oceans.json';
import MessageFormat from 'messageformat'

let messages;
export const init = (i18n = {}) => {
  const mf = new MessageFormat('en');
  messages = {...mf.compile(data), ...i18n};
};

export const t = (key, options) => {
    return messages[key](options);
};
