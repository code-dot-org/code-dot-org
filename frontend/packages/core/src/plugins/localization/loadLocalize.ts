import type {LocalizeJS, LocalizeOptions} from './Localize';
import {RTLLocales} from './Localization';

export const LOCALIZE_SCRIPT_URL = 'https://global.localizecdn.com/localize.js';

/**
 * Options for loadLocalize. Every LocalizeJS option may be overridden; only
 * the project key is required.
 */
export type LoadLocalizeOptions = LocalizeOptions;

/**
 * Matches the options apps/src/localization/entrypoint.js passes, except
 * saveNewPhrases. LocalizeJS defaults that to true; we default it to false
 * so a page sends new strings to the TMS only when its host asks.
 */
export const DefaultLocalizeOptions: Omit<LocalizeOptions, 'key'> = {
  rememberLanguage: true,
  retranslateOnNewPhrases: true,
  disableWidget: true,
  allowIgnoredChildrenInIsolate: true,
  saveNewPhrases: false,
};

function setDocumentDirection(language: string): void {
  const rtl = RTLLocales.includes(language.split('-')[0]);
  document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
}

function initializeLocalize(
  Localize: LocalizeJS,
  options: LocalizeOptions,
): void {
  Localize.initialize(options);

  const setLanguage = Localize.setLanguage.bind(Localize);
  Localize.setLanguage = (language: string) => {
    setLanguage(language);
    setDocumentDirection(language);
  };
  setDocumentDirection(Localize.getLanguage());

  if (options.disableWidget) {
    Localize.hideWidget();
  }
}

/**
 * Loads the LocalizeJS widget for a project and publishes the pending
 * widget as window.LocalizeLoader.
 *
 * A page has one LocalizeJS project. If the host page already set
 * window.LocalizeLoader (the Rails layout does), that loader is returned
 * and the given key is ignored.
 *
 * @param options - The project key and any LocalizeJS option overrides.
 * @returns Resolves to the widget, or undefined if the script fails to load.
 */
export function loadLocalize(
  options: LoadLocalizeOptions,
): Promise<LocalizeJS | undefined> {
  if (window.LocalizeLoader) {
    return window.LocalizeLoader;
  }

  const settings: LocalizeOptions = {...DefaultLocalizeOptions, ...options};
  const script = document.createElement('script');
  script.src = LOCALIZE_SCRIPT_URL;
  script.type = 'text/javascript';

  const loader = new Promise<LocalizeJS | undefined>(resolve => {
    script.onload = () => {
      const Localize = window.Localize;
      if (Localize) {
        initializeLocalize(Localize, settings);
      }
      resolve(Localize);
    };
    script.onerror = () => {
      console.error(`Failed to load Localize script: ${LOCALIZE_SCRIPT_URL}`);
      resolve(undefined);
    };
  });

  // Typed as resolving to LocalizeJS for legacy readers; ours tolerate undefined.
  window.LocalizeLoader = loader as Promise<LocalizeJS>;
  document.head.appendChild(script);
  return loader;
}
