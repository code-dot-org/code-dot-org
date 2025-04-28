import {useState, useCallback, useEffect} from 'react';

import {localization} from './Localization';

/**
 * This hook will cause a rerender of a component when the locale changed by
 * giving you a locale state.
 */
export const useLocalization = () => {
  const [locale, setLocale] = useState<string>(localization().locale);
  const updateCallback = useCallback(
    (language: string) => {
      setLocale(localization().locale);
    },
    [setLocale]
  );

  useEffect(() => {
    localization().on('change', info => {
      updateCallback(info.code);
    });
  }, [updateCallback]);

  return locale;
};

export default useLocalization;
