import data from '../../i18n/oceans.json';
import MessageFormat from 'messageformat'

let messages;
export const init = () => {
  const mf = new MessageFormat('en');
  messages = mf.compile(data);
};

export const t = (key, options) => {
    return messages[key](options);
};
