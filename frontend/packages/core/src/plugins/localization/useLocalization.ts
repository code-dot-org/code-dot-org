import {useState, useEffect, useRef} from 'react';

import {localization} from './Localization';
import type {LanguageInfo} from './Localization';

/**
 * Subscribes to the localization singleton and returns reactive locale state.
 *
 * Return shape upgraded from `locale: string` to `{locale, locales, isReady}`
 * at the point when there were zero external callers — no migration cost and
 * the richer shape subsumes every use case the narrow string served. The
 * previous implementation also lacked `localization.off` cleanup on unmount;
 * that correctness fix is included here.
 *
 * `isReady` flips to true once `localization.waitUntilLoaded()` settles,
 * allowing callers to show a skeleton instead of the English-only fallback
 * list that `locales` returns before LocalizeJS initializes.
 *
 * @returns `{locale, locales, isReady}` — reactive locale state.
 */
export const useLocalization = (): {
  locale: string;
  locales: LanguageInfo[];
  isReady: boolean;
} => {
  const [locale, setLocale] = useState(localization.locale);
  const [locales, setLocales] = useState<LanguageInfo[]>(localization.locales);
  const [isReady, setIsReady] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const onChange = () => {
      if (!mountedRef.current) return;
      setLocale(localization.locale);
      setLocales(localization.locales);
    };

    localization.on('change', onChange);

    localization.waitUntilLoaded().then(() => {
      if (mountedRef.current) setIsReady(true);
    });

    return () => {
      mountedRef.current = false;
      localization.off('change', onChange);
    };
  }, []);

  return {locale, locales, isReady};
};
