import {useEffect, useState} from 'react';

import {localization} from './Localization';
import type {LanguageInfo, Localization} from './Localization';

export type LocaleSource = Pick<
  Localization,
  'locale' | 'locales' | 'on' | 'off' | 'waitUntilLoaded'
>;

export interface LocalesState {
  /** The current language code. */
  locale: string;
  /** The languages the active LocalizeJS project serves. */
  locales: LanguageInfo[];
  /** False until LocalizeJS has loaded or failed to load. */
  isReady: boolean;
}

/**
 * State for a language picker. Re-renders when the language or the list of
 * available languages changes.
 *
 * @param source - The localization instance; tests pass a stand-in.
 */
export function useLocales(source: LocaleSource = localization): LocalesState {
  const [state, setState] = useState({
    locale: source.locale,
    locales: source.locales,
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const onChange = () => {
      if (mounted) {
        setState({locale: source.locale, locales: source.locales});
      }
    };

    source.on('change', onChange);

    source.waitUntilLoaded().then(() => {
      if (mounted) {
        setIsReady(true);
        onChange();
      }
    });

    return () => {
      mounted = false;
      source.off('change', onChange);
    };
  }, [source]);

  return {...state, isReady};
}
