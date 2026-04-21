import {useState, useEffect} from 'react';

import localization from './Localization';

/**
 * This hook will cause a rerender of a component when the locale changed by
 * giving you a locale state.
 */
export const useLocalization = () => {
  const [locale, setLocale] = useState<string>(localization.locale);

  useEffect(() => {
    localization.on('change', info => {
      setLocale(localization.locale);
    });
  }, [setLocale]);

  return locale;
};

export default useLocalization;
