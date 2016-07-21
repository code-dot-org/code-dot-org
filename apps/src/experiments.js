/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.
 */
/* global trackEvent */

const queryString = require('query-string');

const experiments = module.exports;
const STORAGE_KEY = 'experimentsList';
const GA_EVENT = 'experiments';

/**
 * Get our query string. Provided as a method so that tests can mock this.
 */
experiments.getQueryString_ = function () {
  return window.location.search;
};

experiments.getEnabledExperiments = function () {
  const jsonList = localStorage.getItem(STORAGE_KEY);
  const enabled = jsonList ? JSON.parse(jsonList) : [];
  return enabled;
};

experiments.setEnabled = function (key, shouldEnable) {
  const allEnabled = this.getEnabledExperiments();
  if (allEnabled.indexOf(key) < 0 && shouldEnable) {
    allEnabled.push(key);
    trackEvent(GA_EVENT, 'enable', key);
  } else if (allEnabled.indexOf(key) >= 0 && !shouldEnable) {
    allEnabled.splice(allEnabled.indexOf(key), 1);
    trackEvent(GA_EVENT, 'disable', key);
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
  let enabled = this.getEnabledExperiments().indexOf(key) >= 0;
  const query = queryString.parse(this.getQueryString_());

  const enableQuery = query['enableExperiments'];
  const disableQuery = query['disableExperiments'];
  const deprecatedKeyQuery = query[key];

  if (enableQuery) {
    const experimentsToEnable = enableQuery.split(',');
    if (experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      this.setEnabled(key, true);
    }
  }

  if (disableQuery) {
    const experimentsToDisable = disableQuery.split(',');
    if (experimentsToDisable.indexOf(key) >= 0) {
      enabled = false;
      this.setEnabled(key, false);
    }
  }

  return enabled;
};
