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

import getScriptData from '@cdo/apps/util/getScriptData';

const {projectKey} = getScriptData('localizejs');

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

    const cdoLanguage = language === 'source' ? 'en' : language;

    const ensureSelector = cdoLanguage => {
      const localeSelect =
        document.querySelector('#locale') ||
        document.querySelector("select[name='locale']");
      if (localeSelect) {
        const optionIndex =
          localeSelect.querySelector("option[value='" + cdoLanguage + "']")
            ?.index || 0;
        localeSelect.selectedIndex = optionIndex;
      }
    };

    // This function ensures that the dropdowns show the requested language
    const handleChange = event => {
      event.stopPropagation();
      event.preventDefault();
      Localize.cdoSetLanguage(event.target.selectedOptions[0].value);
    };

    // When the site loads, ensure the language selector has the correct value
    const onDOMLoad = () => {
      const localeSelect =
        document.querySelector('#locale') ||
        document.querySelector("select[name='locale']");
      if (localeSelect) {
        // Remove all options and replace them with the LocalizeJS options we have
        Localize.getAvailableLanguages((err, data) => {
          localeSelect.innerHTML = '';
          data.forEach(info => {
            const option = document.createElement('option');
            option.value = info.code;
            option.textContent = info.name;
            localeSelect.append(option);
          });
        });
        localeSelect.removeAttribute('onchange');
        localeSelect.addEventListener('change', handleChange);
      }
      ensureSelector(cdoLanguage);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onDOMLoad);
    } else {
      // 'interactive' or 'complete' — DOMContentLoaded has already fired
      onDOMLoad();
    }

    // Translate everything in the Blockly message pool
    ensureSelector(cdoLanguage);
  };

  // Just in case... any other calls to the Localize setLanguage will also hit
  // our custom code which also ensures the site dropdowns match
  Localize.setLanguage = Localize.cdoSetLanguage;

  // Ensure we are setting the correct direction on our <html> tag
  Localize.cdoSetLanguage(Localize.getLanguage());

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
