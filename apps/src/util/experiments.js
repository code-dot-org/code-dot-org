/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 * Experiment state is persisted across page loads using local storage.  Note
 * that it's only written when isEnabled is called for the key in question.
 */
import {trySetLocalStorage} from '../utils';
import Cookie from 'js-cookie';
import trackEvent from './trackEvent';
import DCDO from '@cdo/apps/dcdo';

const queryString = require('query-string');

const experiments = module.exports;
const STORAGE_KEY = 'experimentsList';
const GA_EVENT = 'experiments';
const EXPERIMENT_LIFESPAN_HOURS = 12;

// Specific experiment names
experiments.REDUX_LOGGING = 'reduxLogging';
experiments.SCHOOL_AUTOCOMPLETE_DROPDOWN_NEW_SEARCH =
  'schoolAutocompleteDropdownNewSearch';
experiments.SHOW_UNPUBLISHED_FIREBASE_TABLES = 'showUnpublishedFirebaseTables';
experiments.TEACHER_DASHBOARD_SECTION_BUTTONS =
  'teacher-dashboard-section-buttons';
experiments.TEACHER_DASHBOARD_SECTION_BUTTONS_ALTERNATE_TEXT =
  'teacher-dashboard-section-buttons-alternate-text';
experiments.FINISH_DIALOG_METRICS = 'finish-dialog-metrics';
experiments.I18N_TRACKING = 'frontend-i18n-tracking';
experiments.TIME_SPENT = 'time-spent';
experiments.BYPASS_DIALOG_POPUP = 'bypass-dialog-popup';
experiments.SPECIAL_TOPIC = 'special-topic';
experiments.CLEARER_SIGN_UP_USER_TYPE = 'clearerSignUpUserType';
experiments.OPT_IN_EMAIL_REG_PARTNER = 'optInEmailRegPartner';
// Experiment for showing a backgrounds tab and enabling student upload
// for Sprite Lab animations
experiments.BACKGROUNDS_AND_UPLOAD = 'backgroundsTab';
experiments.SECTION_SETUP_REFRESH = 'sectionSetupRefresh';
// Experiment for testing Blockly workspace serialization with the JSON system.
experiments.BLOCKLY_JSON = 'blocklyJson';
// Experiment for showing the gender field
experiments.GENDER_FEATURE_ENABLED = 'gender';
// Experiment for enabling the CPA lockout
experiments.CPA_EXPERIENCE = 'cpa_experience';
experiments.AI_RUBRICS = 'ai-rubrics';
experiments.NON_AI_RUBRICS = 'non-ai-rubrics';
//Experiment for AI Rubrics redesign
experiments.AI_RUBRICS_REDESIGN = 'ai-rubrics-redesign';
// Experiment for showing the toggle a teacher can use to turn on AI Tutor for their section
experiments.AI_TUTOR_ACCESS = 'ai-tutor';
// Uses Google Blockly for a given user across labs/levels until the experiment is disabled
experiments.GOOGLE_BLOCKLY = 'google_blockly';
// Adds documentation links to block context menus in Sprite Lab (supported with Google Blockly only)
experiments.SPRITE_LAB_DOCS = 'sl_docs';

/**
 * This was a gamified version of the finish dialog, built in 2018,
 * but never fully shipped.
 * See github.com/code-dot-org/code-dot-org/pull/19557
 */
experiments.BUBBLE_DIALOG = 'bubbleDialog';

/**
 * Get our query string. Provided as a method so that tests can mock this.
 */
experiments.getQueryString_ = function () {
  return window.location.search;
};

experiments.getStoredExperiments_ = function () {
  // Get experiments on current user from experiments cookie
  const experimentsCookie = Cookie.get('_experiments' + window.cookieEnvSuffix);
  const userExperiments = experimentsCookie
    ? JSON.parse(decodeURIComponent(experimentsCookie)).map(name => ({
        key: name,
      }))
    : [];

  // Get experiments stored in local storage.
  try {
    const jsonList = localStorage.getItem(STORAGE_KEY);
    const storedExperiments = jsonList ? JSON.parse(jsonList) : [];
    const now = Date.now();
    const enabledExperiments = storedExperiments.filter(experiment => {
      return (
        experiment.key &&
        (experiment.expiration === undefined || experiment.expiration > now)
      );
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

experiments.setEnabled = function (key, shouldEnable, expiration = undefined) {
  const allEnabled = this.getStoredExperiments_();
  const experimentIndex = allEnabled.findIndex(
    experiment => experiment.key === key
  );
  if (shouldEnable) {
    if (experimentIndex < 0) {
      allEnabled.push({key, expiration});
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
 * Checks for the experiment while allowing for a simpler query string
 * parameter to enable the experiment. For instance, if `key` is "foo",
 * the experiment is allowed by any other means but also if `?foo=1` is
 * specified in the current URL.
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */
experiments.isEnabledAllowingQueryString = function (key) {
  const query = queryString.parse(this.getQueryString_());

  // Look for ?my_experiment=1 style experiment keys
  if (query[key]) {
    // We enable when any query string matches, but do not
    // set it in the session storage.
    return true;
  }

  return experiments.isEnabled(key);
};

/**
 * Checks whether provided experiment is enabled or not.
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */
experiments.isEnabled = function (key) {
  const storedExperiments = this.getStoredExperiments_();
  let enabled =
    storedExperiments.some(experiment => experiment.key === key) ||
    !!(
      window.appOptions &&
      window.appOptions.experiments &&
      window.appOptions.experiments.includes(key)
    );
  // Check DCDO to see if this experiment is enabled.
  // User experiment flags and cookie experiment flags take higher priority over DCDO experiments.
  enabled = enabled || !!DCDO.get(key, false);

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
      expirationDate.getHours() + EXPERIMENT_LIFESPAN_HOURS
    );
    const expiration = expirationDate.getTime();

    const experimentsToEnable = tempEnableQuery.split(',');
    if (experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      this.setEnabled(key, true, expiration);
    }
  }

  return enabled;
};
