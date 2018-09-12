/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.  Note
 * that it's only written when isEnabled is called for the key in question.
 */
import { trySetLocalStorage } from '../utils';
import Cookie from 'js-cookie';
import trackEvent from './trackEvent';

const queryString = require('query-string');

const experiments = module.exports;
const STORAGE_KEY = 'experimentsList';
const GA_EVENT = 'experiments';
const EXPERIMENT_LIFESPAN_HOURS = 12;

// Specific experiment names
experiments.REDUX_LOGGING = 'reduxLogging';
experiments.COMMENT_BOX_TAB = 'commentBoxTab';
experiments.DEV_COMMENT_BOX_TAB = 'devCommentBoxTab';
experiments.SCHOOL_AUTOCOMPLETE_DROPDOWN_NEW_SEARCH = 'schoolAutocompleteDropdownNewSearch';
experiments.AUDIO_LIBRARY_DEFAULT = 'audioLibraryDefault';

// This is a per user experiment and is defined in experiments.rb
// On the front end we are treating it as an experiment group.
experiments.TEACHER_EXP_2018 = '2018-teacher-experience';
experiments.TEACHER_EXP_2018_LIST = [
  experiments.COMMENT_BOX_TAB,
];

/**
 * Get our query string. Provided as a method so that tests can mock this.
 */
experiments.getQueryString_ = function () {
  return window.location.search;
};

experiments.getStoredExperiments_ = function () {
  // Get experiments on current user from experiments cookie
  const experimentsCookie = Cookie.get('_experiments' + window.cookieEnvSuffix);
  const userExperiments = experimentsCookie ?
    JSON.parse(decodeURIComponent(experimentsCookie)).map(name => ({key: name})) :
    [];

  // Get experiments stored in local storage.
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
    return userExperiments.concat(enabledExperiments);
  } catch (e) {
    return userExperiments;
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
  const storedExperiments = this.getStoredExperiments_();
  let enabled = storedExperiments
    .some(experiment => experiment.key === key) ||
    !!(window.appOptions &&
      window.appOptions.experiments &&
      window.appOptions.experiments.includes(key));

  // Check for parent experiment
  if (storedExperiments.map(obj => obj.key).includes(experiments.TEACHER_EXP_2018) &&
    experiments.TEACHER_EXP_2018_LIST.includes(key)) {
    enabled = true;
  }

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
