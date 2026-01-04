/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled using query parameters:
 *   enable:  http://foo.com/?enableExperiments=experimentOne,experimentTwo
 *   disable: http://foo.com/?disableExperiments=experimentOne,experimentTwo
 *
 * Experiment state is persisted across page loads using local storage.  Note
 * that it's only written when isEnabled is called for the key in question.
 */

import Cookie from 'js-cookie';
import queryString from 'query-string';

declare global {
  interface Window {
    /**
     * Supporting the old-style appOptions block being present.
     */
    appOptions?: {
      experiments?: string[];
    };
  }
}

/**
 * Simple wrapper around localStorage.setItem that catches any exceptions (for
 * example when we call setItem in Safari's private mode)
 * @return 'true' if we set successfully
 */
const trySetLocalStorage: (item: string, value: string) => boolean = (item, value) => {
  try {
    localStorage.setItem(item, value);
    return true;
  } catch (_) {
    // Ignore errors and we will return false
  }
  return false;
};

/**
 * Keeps track of active experiments.
 */
export enum Experiment {
  REDUX_LOGGING = 'reduxLogging',
  SCHOOL_AUTOCOMPLETE_DROPDOWN_NEW_SEARCH =
    'schoolAutocompleteDropdownNewSearch',
  SHOW_UNPUBLISHED_DATASET_TABLES = 'showUnpublishedDatasetTables',
  TEACHER_DASHBOARD_SECTION_BUTTONS =
    'teacher-dashboard-section-buttons',
  TEACHER_DASHBOARD_SECTION_BUTTONS_ALTERNATE_TEXT =
    'teacher-dashboard-section-buttons-alternate-text',
  FINISH_DIALOG_METRICS = 'finish-dialog-metrics',
  I18N_TRACKING = 'frontend-i18n-tracking',
  TIME_SPENT = 'time-spent',
  BYPASS_DIALOG_POPUP = 'bypass-dialog-popup',
  SPECIAL_TOPIC = 'special-topic',
  // Experiment for showing a backgrounds tab and enabling student upload
  // for Sprite Lab animations
  BACKGROUNDS_AND_UPLOAD = 'backgroundsTab',
  SECTION_SETUP_REFRESH = 'sectionSetupRefresh',
  // Experiment for showing the gender field
  GENDER_FEATURE_ENABLED = 'gender',
  // Experiment for enabling the AI-TA differentiation chat
  AI_DIFFERENTIATION = 'ai-differentiation',
  // Experiment for showing the toggle a teacher can use to turn on AI Tutor for their section
  AI_TUTOR_ACCESS = 'ai-tutor',
  // Adds a "Get help with this block" option to block context menus if docs exist (e.g. Sprite Lab)
  BLOCKLY_DOCS = 'blockly_docs',
  // Adds the ability to toggle between v1 and v2 of the section progress page of the teacher dashboard
  SECTION_PROGRESS_V2 = 'section_progress_v2',
  // Allows the playspace to be dragged to take up a larger portion of the screen
  BIG_PLAYSPACE = 'bigPlayspace',
  // Allows user to view the new version of the teacher navigation
  TEACHER_LOCAL_NAV_V2 = 'teacher-local-nav-v2',
  // Allows users to view the new version of the teacher homepage
  TEACHER_HOMEPAGE_V2 = 'teacher-homepage-v2',
  // Use glow effect for Blockly block highlighting
  BLOCKLY_GLOW_HIGHLIGHT = 'blockly-glow-highlight',
  // Turn on Blockly Keyboard Navigation
  BLOCKLY_KEYBOARD_NAVIGATION = 'blockly-keyboard-navigation',
  // Use nested course URLs like /courses/csd-2024/units/1/...
  MODULARITY = 'modularity',
  // LocalizeJS
  LOCALIZEJS = 'localizejs',
  // Use the new lab2 instructions panel
  LAB2_INSTRUCTIONS_V2 = 'lab2-instructions-v2',
  /**
   * This was a gamified version of the finish dialog, built in 2018,
   * but never fully shipped.
   * See github.com/code-dot-org/code-dot-org/pull/19557
   */
  BUBBLE_DIALOG = 'bubbleDialog',
  ZELOS = 'zelos',
}

const STORAGE_KEY = 'experimentsList';
const EXPERIMENT_LIFESPAN_HOURS = 12;

const getQueryString = () => (typeof window !== 'undefined' ? window.location.search : '');

export interface ExperimentData {
  key: string;
  expiration?: number;
}

export const getStoredExperiments: () => ExperimentData[] = () => {
  // Get experiments on current user from experiments cookie
  const experimentsCookie = Cookie.get('_experiments');
  const userExperiments: ExperimentData[] = experimentsCookie
    ? JSON.parse(decodeURIComponent(experimentsCookie)).map((name: string) => ({
        key: name,
      }))
    : [];

  // Get experiments stored in local storage.
  try {
    const jsonList = localStorage.getItem(STORAGE_KEY);
    const storedExperiments: ExperimentData[] = jsonList ? JSON.parse(jsonList) : [];
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
  } catch (_) {
    // Ignore errors and we will return the experiment list we already have
  }
  return userExperiments;
};

export const getEnabledExperiments = () => {
  return getStoredExperiments().map(experiment => experiment.key);
};

export const setEnabled = (key: Experiment, shouldEnable: boolean, expiration?: number) => {
  const allEnabled = getStoredExperiments();
  const experimentIndex = allEnabled.findIndex(
    experiment => experiment.key === key
  );
  if (shouldEnable) {
    if (experimentIndex < 0) {
      allEnabled.push({key, expiration});
    } else {
      allEnabled[experimentIndex].expiration = expiration;
    }
  } else if (experimentIndex >= 0) {
    allEnabled.splice(experimentIndex, 1);
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
 * @param key - Name of experiment in question
 */
export const isEnabledAllowingQueryString: (key: Experiment) => boolean = (key) => {
  const query = queryString.parse(getQueryString());

  // Look for ?my_experiment=1 style experiment keys
  if (query[key]) {
    // We enable when any query string matches, but do not
    // set it in the session storage.
    return true;
  }

  return isEnabled(key);
};

/**
 * Checks whether provided experiment is enabled or not.
 * @param key - Name of experiment in question
 */
export const isEnabled: (key: Experiment) => boolean = (key) => {
  const storedExperiments = getStoredExperiments();
  let enabled =
    storedExperiments.some(experiment => experiment.key === key) ||
    !!window.appOptions?.experiments?.includes(key);

  const query = queryString.parse(getQueryString());
  const enableQuery = query['enableExperiments'];
  const disableQuery = query['disableExperiments'];
  const tempEnableQuery = query['tempEnableExperiments'];

  if (enableQuery) {
    const experimentsToEnable = Array.isArray(enableQuery) ? enableQuery : enableQuery.split(',');
    if (experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      setEnabled(key, true);
    }
  }

  if (disableQuery) {
    const experimentsToDisable = Array.isArray(disableQuery) ? disableQuery : disableQuery.split(',');
    if (experimentsToDisable.indexOf(key) >= 0) {
      enabled = false;
      setEnabled(key, false);
    }
  }

  if (tempEnableQuery) {
    const expirationDate = new Date();
    expirationDate.setHours(
      expirationDate.getHours() + EXPERIMENT_LIFESPAN_HOURS
    );
    const expiration = expirationDate.getTime();

    const experimentsToEnable = Array.isArray(tempEnableQuery) ? tempEnableQuery : tempEnableQuery.split(',');
    if (experimentsToEnable.indexOf(key) >= 0) {
      enabled = true;
      setEnabled(key, true, expiration);
    }
  }

  return enabled;
};
