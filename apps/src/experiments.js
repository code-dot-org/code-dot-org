/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiment=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiment=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.
 */

var queryString = require('query-string');

var experiments = module.exports;
// TODO(pcardune): remove OLD_KEY_WHITELIST when whitelisted experiments have
// shipped
var OLD_KEY_WHITELIST = ['topInstructions'];
var STORAGE_KEY = 'experimentsList';

/**
 * Get our query string. Provided as a method so that tests can mock this.
 */
experiments.getQueryString_ = function () {
  return window.location.search;
};

experiments.getEnabledExperiments = function () {
  var jsonList = localStorage.getItem(STORAGE_KEY);
  var enabled = jsonList ? JSON.parse(jsonList) : [];
  OLD_KEY_WHITELIST.forEach(function (key) {
    if (localStorage.getItem('experiments-' + key) === 'true') {
      enabled.push(key);
    }
  });
  return enabled;
};

experiments.setEnabled = function (key, shouldEnable) {
  var allEnabled = this.getEnabledExperiments();
  if (!allEnabled.includes(key) && shouldEnable) {
    allEnabled.push(key);
  } else if (allEnabled.includes(key) && !shouldEnable) {
    allEnabled.splice(allEnabled.indexOf(key), 1);
  } else {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(allEnabled));
};

/**
 * Checks whether provided experiment is enabled or not
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */
experiments.isEnabled = function (key) {
  var enabled = this.getEnabledExperiments().includes(key);
  var query = queryString.parse(this.getQueryString_());

  var enableQuery = query['enableExperiments'];
  var disableQuery = query['disableExperiments'];
  var deprecatedKeyQuery = query[key];

  if (enableQuery) {
    var experimentsToEnable = enableQuery.split(',');
    if (experimentsToEnable.includes(key)) {
      enabled = true;
      this.setEnabled(key, true);
    }
  }

  if (disableQuery) {
    var experimentsToDisable = disableQuery.split(',');
    if (experimentsToDisable.includes(key)) {
      enabled = false;
      this.setEnabled(key, false);
    }
  }

  if (OLD_KEY_WHITELIST.includes(key) && deprecatedKeyQuery) {
    enabled = deprecatedKeyQuery === 'true';
    this.setEnabled(key, enabled);
  }
  return enabled;
};
