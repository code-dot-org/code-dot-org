/**
 * The loading point for Localize and our localization engine.
 *
 * This should be the first code run in our application <head> and will be
 * responsible for loading and initializing LocalizeJS.
 */

import {get, set} from 'js-cookie';

/**
 * The current course listing and a mapping between them and Localize project
 * keys. This is a temporary measure for now.
 */
const csd_prefixes = ['/courses/csd-2024'];

const csf_prefixes = [
  '/courses/k5-unplugged',
  '/courses/express-2024',
  '/courses/pre-express-2024',
];

const donor_prefixes = [
  '/courses/customizing-llms-2024',
  '/courses/self-paced-pl-ai-101-2024',
  '/courses/foundations-gen-ai-2024',
  '/courses/foundations-gen-ai-2025',
  '/courses/foundations-generative-ai-unplugged',
  '/courses/k5-ai-data-2024',
  '/courses/elementaryai-2024',
  '/courses/3-5gamedesign-2024',
  '/courses/elem-game-design-2024',
];

const aif_prefixes = ['/courses/artificial-intelligence-foundations-2025'];

const dashboard_prefixes = ['/home', '/users', '/teacher_dashboard'];

const prefixes = {
  MlKri360o3v2T: csd_prefixes,
  '3vPUSGZrdllW2': csf_prefixes,
  I0P5RaUEW8s5h: donor_prefixes,
  zM53S8yC4TNgU: aif_prefixes,
  XJXXkBlsAbHVD: dashboard_prefixes,
};

const live = [
  '/courses/foundations-gen-ai-2024',
  '/courses/foundations-gen-ai-2025',
];

const experiments = JSON.parse(window.localStorage.experimentsList || '[]');
const inExperiment =
  experiments.some(experiment =>
    experiment ? experiment.key === 'localizejs' : false
  ) || window.location.search.includes('localizejs=');
const projectKeys = Object.entries(prefixes).filter(([projectId, prefixes]) =>
  prefixes.some(prefix => window.location.pathname.startsWith(prefix))
);

const isLive = live.some(prefix => window.location.pathname.startsWith(prefix));

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
    key: projectKeys[0][0],
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
    document.addEventListener('DOMContentLoaded', () => {
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
    });

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

if (projectKeys.length > 0 && (inExperiment || isLive)) {
  /**
   * If the current locale is not English, we must reload in English.
   */
  const locale = get('language_') || 'en';
  if (!locale.startsWith('en')) {
    set('language_', 'en-US');
    set('language_', 'en-US', {domain: '.code.org'});
    window.location.reload();
  } else {
    // Load the Localize widget
    const script = document.createElement('script');
    const scriptUrl = 'https://global.localizecdn.com/localize.js';
    script.src = scriptUrl;
    script.type = 'text/javascript';

    // Create the loader promise for upstream initialization in the
    // Localization class.
    window.LocalizeLoader = new Promise((resolve, reject) => {
      script.onload = () => {
        // Optional: Handle script load event
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
}
