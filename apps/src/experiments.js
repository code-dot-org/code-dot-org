/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.
 */

var queryString = require('query-string');

var experiments = module.exports;
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
  return enabled;
};

experiments.setEnabled = function (key, shouldEnable) {
  var allEnabled = this.getEnabledExperiments();
  if (allEnabled.indexOf(key) < 0 && shouldEnable) {
    allEnabled.push(key);
  } else if (allEnabled.indexOf(key) >= 0 && !shouldEnable) {
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
  var enabled = this.getEnabledExperiments().indexOf(key) >= 0;
  var query = queryString.parse(this.getQueryString_());

  var enableQuery = query['enableExperiments'];
  var disableQuery = query['disableExperiments'];
  var deprecatedKeyQuery = query[key];

  if (enableQuery) {
    var experimentsToEnable = enableQuery.split(',');
    if (experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      this.setEnabled(key, true);
    }
  }

  if (disableQuery) {
    var experimentsToDisable = disableQuery.split(',');
    if (experimentsToDisable.indexOf(key) >= 0) {
      enabled = false;
      this.setEnabled(key, false);
    }
  }

  return enabled;
};
