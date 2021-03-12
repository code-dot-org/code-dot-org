import experiments from '@cdo/apps/util/experiments';
import {getI18nStringTrackerWorker} from '@cdo/apps/util/i18nStringTrackerWorker';

export default function localeWithI18nStringTracker(locale, source) {
  if (!experiments.isEnabled(experiments.I18N_TRACKING)) {
    return locale;
  }

  const localeWithTracker = {};
  // Iterates each function in the given locale object and creates a wrapper function.
  Object.keys(locale).forEach(function(stringKey, index) {
    localeWithTracker[stringKey] = function(d) {
      const value = locale[stringKey](d);
      log(stringKey, source);
      return value;
    };
  });
  return localeWithTracker;
}

// Records the usage of the given i18n string key from the given source file.
// @param {string} stringKey  The string key used to look up the i18n value e.g. 'home.banner_text'
// @param {string} source Context for where the given string key came from e.g. 'maze', 'dance', etc.
function log(stringKey, source) {
  if (!stringKey || !source) {
    return;
  }

  // Send the usage data to a background worker thread to be buffered and sent.
  getI18nStringTrackerWorker().log(stringKey, source);
}
