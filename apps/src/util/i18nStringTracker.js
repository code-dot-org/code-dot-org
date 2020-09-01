import experiments from '@cdo/apps/util/experiments';

// A map of "string source" -> "list of strings used"
// For example: window.stringUsageSources['maze'] = ['level_1.instruction.header']
// The data recorded in this will periodically be uploaded.
if (!window.stringUsageSources) {
  // Initialize if it doesn't already exist.
  window.stringUsageSources = {};
}

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
// @param stringKey [String] The string key used to look up the i18n value e.g. 'home.banner_text'
// @param source [String] Context for where the given string key came from e.g. 'maze', 'dance', etc.
function log(stringKey, source) {
  if (!stringKey || !source) {
    return;
  }
  if (!window.stringUsageSources[source]) {
    // Initialize the list of strings for the source if it doesn't already exist.
    window.stringUsageSources[source] = new Set();
  }
  window.stringUsageSources[source].add(stringKey);
}
