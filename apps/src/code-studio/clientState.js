/**
 * @file Helper functions for accessing client state. This state is stored in a
 *       combination of cookies and HTML5 web storage.
 */
import cookies from 'js-cookie';
var sessionStorage = window.sessionStorage;

import { mergeActivityResult } from './activityUtils';

var clientState = module.exports = {};

clientState.queryParams = require('./utils').queryParams;

/**
 * Number of days before client state cookie expires.
 * @type {number}
 * @private
 */
clientState.EXPIRY_DAYS = 365;

/**
 * Maximum number of lines of code that can be stored in the cookie
 * @type {number}
 * @private
 */
var MAX_LINES_TO_SAVE = 1000;

/**
 * Values larger than this result are server-dependent and shouldn't be cached
 * in client storage.
 */
clientState.MAXIMUM_CACHABLE_RESULT = 999;

var COOKIE_OPTIONS = {
  expires: clientState.EXPIRY_DAYS,
  path: '/'
};

clientState.reset = function () {
  try {
    cookies.remove('lines', {path: '/'});
    sessionStorage.clear();
  } catch (e) {}
};

/**
 * Returns the client-cached copy of the level source for the given script
 * level, if it's newer than the given timestamp.
 * @param {string} scriptName
 * @param {number} levelId
 * @param {number=} timestamp
 * @returns {string|undefined} Cached copy of the level source, or undefined if
 *   the cached copy is missing/stale.
 */
clientState.sourceForLevel = function (scriptName, levelId, timestamp) {
  var data = sessionStorage.getItem(createKey(scriptName, levelId, 'source'));
  if (data) {
    var parsed;
    try {
      parsed = JSON.parse(data);
    } catch (e) {
      return;
    }
    if (!timestamp || parsed.timestamp > timestamp) {
      return parsed.source;
    }
  }
};

/**
 * Cache a copy of the level source along with a timestamp. Posts to /milestone
 * may be queued, so save the data in sessionStorage to present a consistent
 * client view.
 * @param {string} scriptName
 * @param {number} levelId
 * @param {number} timestamp
 * @param {string} source
 */
clientState.writeSourceForLevel = function (scriptName, levelId, timestamp, source) {
  safelySetItem(createKey(scriptName, levelId, 'source'), JSON.stringify({
    source: source,
    timestamp: timestamp
  }));
};

/**
 * Returns the progress attained for the given level.
 * @param {string} scriptName The script name
 * @param {number} levelId The level
 * @returns {number}
 */
clientState.levelProgress = function (scriptName, levelId) {
  var progressMap = clientState.allLevelsProgress();
  return (progressMap[scriptName] || {})[levelId] || 0;
};

/**
 * Tracks the users progress after they click run. Results larger than 999 are
 * reserved for server-dependent changes and can't be cached locally.
 * @param {boolean} result - Whether the user's solution is successful
 * @param {number} lines - Number of lines of code user wrote in this solution
 * @param {number} testResult - Indicates pass, fail, perfect
 * @param {string} scriptName - Which script this is for
 * @param {number} levelId - Which level this is for
 */
clientState.trackProgress = function (result, lines, testResult, scriptName, levelId) {
  if (result && isFinite(lines)) {
    addLines(lines);
  }

  var savedResult = clientState.levelProgress(scriptName, levelId);
  if (testResult <= clientState.MAXIMUM_CACHABLE_RESULT &&
      savedResult !== mergeActivityResult(savedResult, testResult)) {
    setLevelProgress(scriptName, levelId, testResult);
  }
};

/**
 * Write down user progress for an entire script.
 * @param {string} scriptName
 * @param {Object<String, number>} progress
 */
clientState.batchTrackProgress = function (scriptName, progress) {
  var data = {};
  var keys = Object.keys(progress);
  for (let i = 0; i < keys.length; i++) {
    let level = keys[i];
    if (progress[level] && progress[level] <= clientState.MAXIMUM_CACHABLE_RESULT) {
      data[level] = progress[level];
    }
  }

  var progressMap = clientState.allLevelsProgress();
  progressMap[scriptName] = data;
  safelySetItem('progress', JSON.stringify(progressMap));
};

/**
 * Sets the progress attained for the given level
 * @param {string} scriptName The script name
 * @param {number} levelId The level
 * @param {number} progress Indicates pass, fail, perfect
 * @returns {number}
 */
function setLevelProgress(scriptName, levelId, progress) {
  var progressMap = clientState.allLevelsProgress();
  if (!progressMap[scriptName]) {
    progressMap[scriptName] = {};
  }
  progressMap[scriptName][levelId] = progress;
  safelySetItem('progress', JSON.stringify(progressMap));
}

/**
 * Returns a map from (string) level id to progress value.
 * @return {Object<String, number>}
 */
clientState.allLevelsProgress = function () {
  var progressJson = sessionStorage.getItem('progress');
  try {
    return progressJson ? JSON.parse(progressJson) : {};
  } catch (e) {
    // Recover from malformed data.
    return {};
  }
};

/**
 * Returns the number of lines completed from the cookie.
 * @returns {number}
 */
clientState.lines = function () {
  var linesStr = cookies.get('lines');
  return isFinite(linesStr) ? Number(linesStr) : 0;
};

/**
 * Adds the given number of completed lines.
 * @param {number} addedLines
 */
function addLines(addedLines) {
  var newLines = Math.min(clientState.lines() + Math.max(addedLines, 0), MAX_LINES_TO_SAVE);

  cookies.set('lines', String(newLines), COOKIE_OPTIONS);
}

/**
 * Returns whether or not the user has seen a given video based on contents of the local storage
 * @param videoId
 * @returns {*}
 */
clientState.hasSeenVideo = function (videoId) {
  return hasSeenVisualElement('video', videoId);
};

/**
 * Records that a user has seen a given video in local storage
 * @param videoId
 */
clientState.recordVideoSeen = function (videoId) {
  recordVisualElementSeen('video', videoId);
};

/**
 * Returns whether or not the user has seen the given callout based on contents of the local storage
 * @param calloutId
 * @returns {boolean}
 */
clientState.hasSeenCallout = function (calloutId) {
  return hasSeenVisualElement('callout', calloutId);
};

/**
 * Records that a user has seen a given callout in local storage
 * @param calloutId
 */
clientState.recordCalloutSeen = function (calloutId) {
  recordVisualElementSeen('callout', calloutId);
};

/**
 * Private helper for videos and callouts - persists info in the local storage that a given element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function recordVisualElementSeen(visualElementType, visualElementId) {
  var elementSeenJson = sessionStorage.getItem(visualElementType) || '{}';
  var elementSeen;
  try {
    elementSeen = JSON.parse(elementSeenJson);
    elementSeen[visualElementId] = true;
    safelySetItem(visualElementType, JSON.stringify(elementSeen));
  } catch (e) {
    //Something went wrong parsing the json. Blow it up and just put in the new callout
    elementSeen = {};
    elementSeen[visualElementId] = true;
    safelySetItem(visualElementType, JSON.stringify(elementSeen));
  }
}

/**
 * Cache the user sign-in state into sessionStorage
 * @param {boolean} isSignedIn
 */
clientState.cacheUserSignedIn = function (isSignedIn) {
  safelySetItem('isSignedIn', isSignedIn);
};

/**
 * Get the cached user sign-in state from sessionStorage
 * @returns {boolean} True if the user is signed in (null if we don't know).
 */
clientState.getUserSignedIn = function () {
  let isSignedIn;
  try {
    isSignedIn = JSON.parse(sessionStorage.getItem('isSignedIn'));
  } catch (e) {
    isSignedIn = null;
  }
  return isSignedIn;
};

/**
 * Private helper for videos and callouts - looks in local storage to see if the element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function hasSeenVisualElement(visualElementType, visualElementId) {
  var elementSeenJson = sessionStorage.getItem(visualElementType) || '{}';
  try {
    var elementSeen = JSON.parse(elementSeenJson);
    return elementSeen[visualElementId] === true;
  } catch (e) {
    return false;
  }
}

/**
 * Creates standardized keys for storing values in sessionStorage.
 * @param {string} scriptName
 * @param {number} levelId
 * @param {string=} prefix
 * @return {string}
 */
function createKey(scriptName, levelId, prefix) {
  return (prefix ? prefix + '_' : '') + scriptName + '_' + levelId;
}

/**
 * Don't throw storage errors in Safari private browsing mode.
 */
function safelySetItem(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (e) {
    if (e.name !== "QuotaExceededError") {
      throw e;
    }
  }
}
