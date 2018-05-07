/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.
 */
import { trySetLocalStorage } from '../utils';
import trackEvent from './trackEvent';

const queryString = require('query-string');

const experiments = module.exports;
const STORAGE_KEY = 'experimentsList';
const GA_EVENT = 'experiments';
const EXPERIMENT_LIFESPAN_HOURS = 12;

// specific experiment names
experiments.COURSE_VERSIONS = 'courseVersions';

/**
 * Get our query string. Provided as a method so that tests can mock this.
 */
experiments.getQueryString_ = function () {
  return window.location.search;
};

experiments.getStoredExperiments_ = function () {
  try {
    const jsonList = localStorage.getItem(STORAGE_KEY);
    const storedExperiments = jsonList ? JSON.parse(jsonList) : [];
    const now = Date.now();
    const enabledExperiments = storedExperiments.filter(experiment => {
      return experiment.key &&
        (experiment.expiration === undefined || experiment.expiration > now);
    });
    if (enabledExperiments.length < storedExperiments.length) {
      trySetLocalStorage(STORAGE_KEY, JSON.stringify(enabledExperiments));
    }
    return enabledExperiments;
  } catch (e) {
    return [];
  }
};

experiments.getEnabledExperiments = function () {
  return this.getStoredExperiments_().map(experiment => experiment.key);
};

experiments.setEnabled = function (key, shouldEnable, expiration=undefined) {
  const allEnabled = this.getStoredExperiments_();
  const experimentIndex =
    allEnabled.findIndex(experiment => experiment.key === key);
  if (shouldEnable) {
    if (experimentIndex < 0) {
      allEnabled.push({ key, expiration });
      trackEvent(GA_EVENT, 'enable', key);
    } else {
      allEnabled[experimentIndex].expiration = expiration;
    }
  } else if (experimentIndex >= 0) {
    allEnabled.splice(experimentIndex, 1);
    trackEvent(GA_EVENT, 'disable', key);
  } else {
    return;
  }
  trySetLocalStorage(STORAGE_KEY, JSON.stringify(allEnabled));
};

/**
 * Checks whether provided experiment is enabled or not
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */
experiments.isEnabled = function (key) {
  let enabled = this.getStoredExperiments_()
    .some(experiment => experiment.key === key) ||
    !!(window.appOptions &&
      window.appOptions.experiments &&
      window.appOptions.experiments.includes(key));

  const query = queryString.parse(this.getQueryString_());
  const enableQuery = query['enableExperiments'];
  const disableQuery = query['disableExperiments'];
  const tempEnableQuery = query['tempEnableExperiments'];

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

  if (tempEnableQuery) {
    const expirationDate = new Date();
    expirationDate.setHours(
        expirationDate.getHours() + EXPERIMENT_LIFESPAN_HOURS);
    const expiration = expirationDate.getTime();

    const experimentsToEnable = tempEnableQuery.split(',');
    if (experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      this.setEnabled(key, true, expiration);
    }
  }

  return enabled;
};
