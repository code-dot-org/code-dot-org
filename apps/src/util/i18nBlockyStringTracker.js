import experiments from '@cdo/apps/util/experiments';
import {getI18nStringTrackerWorker} from '@cdo/apps/util/i18nStringTrackerWorker';

export default function trackBlocklyStrings() {
  if (!experiments.isEnabled(experiments.I18N_TRACKING)) {
    return;
  }

  // Blockly strings are used on most levels, therefore we can reduce how often we actually log
  // the string usage.
  // Track usage 1% of the time.
  if (Math.floor(Math.random() * 100) !== 0) {
    return;
  }

  // The strings used by Blockly blocks are defined in the Blockly.Msg object. We will wait a few
  // seconds for all the i18n strings to be loaded into the Blockly.Msg object and then scan it.
  setTimeout(() => {
    if (window.Blockly && window.Blockly.Msg) {
      Object.keys(window.Blockly.Msg).forEach(stringKey => {
        // The blockly strings are in core.json
        log(stringKey, 'core');
      });
    }
  }, 5000);
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
