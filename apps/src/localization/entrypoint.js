/**
 * The loading point for Localize and our localization engine.
 *
 * This should be the first code run in our application <head> and will be
 * responsible for loading and initializing LocalizeJS.
 *
 * Which pages run LocalizeJS, and the project key for each, is decided on the
 * backend: the i18n/_localizejs partial only emits this script -- with the
 * project key in `data-localizejs` -- on LocalizeJS pages, and renders those
 * pages in English so the widget can swap in the visitor's language.
 */

import {get} from 'js-cookie';

import getScriptData from '@cdo/apps/util/getScriptData';
import {
  DefaultLocale,
  LocalizeToI18nLocales,
} from '@cdo/generated-scripts/sharedConstants';

// `projectKey` selects the LocalizeJS project. It is the only thing the backend
// embeds, so LocalizeJS pages stay identical for every visitor and cacheable.
const {projectKey} = getScriptData('localizejs');

// Map an I18n locale (the `language_` cookie, e.g. `es-LA` for the LatAm Global
// Edition) to the code LocalizeJS expects (e.g. `zh-CN` -> `zh-Hans`). This is
// the inverse of LocalizeToI18nLocales; the locale codes there are unique, so
// the inverse is well-defined. We read the cookie here rather than have the
// backend embed the code so the rendered page does not vary per visitor.
const i18nToLocalizeCode = {};
for (const [localizeCode, i18nLocale] of Object.entries(
  LocalizeToI18nLocales
)) {
  i18nToLocalizeCode[i18nLocale] = localizeCode;
}

function localizeLanguage() {
  const locale = get('language_') || DefaultLocale;
  return i18nToLocalizeCode[locale] || locale;
}

function loadLocalize() {
  !(function (a) {
    if (!a.Localize) {
      a.Localize = {};
      for (
        var e = [
            'translate',
            'untranslate',
            'phrase',
            'initialize',
            'translatePage',
            'setLanguage',
            'getLanguage',
            'getSourceLanguage',
            'detectLanguage',
            'getAvailableLanguages',
            'setWidgetLanguages',
            'hideLanguagesInWidget',
            'untranslatePage',
            'bootstrap',
            'prefetch',
            'on',
            'off',
            'hideWidget',
            'showWidget',
          ],
          t = 0;
        t < e.length;
        t++
      )
        a.Localize[e[t]] = function () {};
    }
  })(window);

  const Localize = window.Localize;

  Localize.initialize({
    key: projectKey,
    rememberLanguage: true,
    retranslateOnNewPhrases: true,
    disableWidget: true,
    saveNewPhrases: !(
      window.location.host === 'studio.code.org' ||
      window.location.host === 'code.org'
    ),
  });

  // Add a custom function to Localize:
  Localize.realSetLanguage = Localize.setLanguage;
  Localize.cdoCallbacks = [];
  Localize.cdoSetLanguage = language => {
    // Call LocalizeJS's setLanguage function (which we have renamed to override it)
    Localize.realSetLanguage(language);

    // Set the <html> direction to update it dynamically
    const lang = language.split('-')[0];
    document
      .querySelector('html')
      .setAttribute('dir', ['fa'].includes(lang) ? 'rtl' : 'ltr');
  };

  // Just in case... any other calls to the Localize setLanguage also hit our
  // custom code which keeps the <html> direction in sync.
  Localize.setLanguage = Localize.cdoSetLanguage;

  // Switch to the visitor's language from the `language_` cookie (e.g. a Global
  // Edition locale like es-LA), falling back to whatever LocalizeJS remembers
  // when the page is already in English. This also sets the correct direction
  // on our <html> tag.
  const language = localizeLanguage();
  const initialLanguage = !language.startsWith('en')
    ? language
    : Localize.getLanguage();
  Localize.cdoSetLanguage(initialLanguage);

  // Forcibly hide the widget for good measure
  Localize.hideWidget();
}

if (projectKey) {
  // The backend has already rendered this page in English; load the Localize
  // widget so it can swap in the visitor's language.
  const script = document.createElement('script');
  const scriptUrl = 'https://global.localizecdn.com/localize.js';
  script.src = scriptUrl;
  script.type = 'text/javascript';

  // Create the loader promise for upstream initialization in the
  // Localization class.
  window.LocalizeLoader = new Promise((resolve, reject) => {
    script.onload = () => {
      // Load the localize widget
      loadLocalize();
      resolve(window.Localize);
    };
    script.onerror = () => {
      console.error(`Failed to load Localize script: ${scriptUrl}`);
      reject();
    };
  });

  document.head.appendChild(script);
}
