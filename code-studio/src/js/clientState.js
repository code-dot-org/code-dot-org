/**
 * @file A module for accessing persistent per-user client state.
 *
 * Client state for signed-in users persists even across logins.
 * Client-state for signed-out users is per-tab and goes aways when the tab
 * is closed.
 *
 * Before getting or setting client state, the developer must call
 * setCurrentUserKey with a unique key for the current user, or setAnonymousUser
 * to use temporary state for an anonymous user.
 *
 * Client state for logged in users is "reasonably" durable but not quite hard
 * state-- the client state module garbage-collects the oldest client state
 * if the total size of the client state exceeds the 5MB browser limit. In
 * practice this limit will rarely be reached, but in this case this does
 * occur the database typically has the same state and can be used to refill
 * the client state cache.
 *
 * Implementation notes:
 * We use the 'lscache' npm module to divide local storage into per-user buckets
 * and to expire the least recently created storage slots.
 *
 * The current user key for is kept in the 'user_key' slot in localStorage. For
 * unauthenticated users, where the user_key is the empty string, a second
 * 'anon_user_key' slot in *session* storage is used to store a randomly
 * generated temporary key. By using session storage, we ensure that each tab
 * uses its own key and has its own client state bucket. The temporary
 * localStorage for anonymous user keys is cleared when setCurrentUserKey is
 * called for a signed in user.
 *
 * The code that uses this module typically merges the client state with the
 * state from the server (if available) so it captures both progress on the
 * current machine and progress by the same user on other machines.
 */

'use strict';

var lscache = require('lscache');

module.exports = function () {

var clientState = {};

/**
 * Max number of minutes before client state expires, current 10 years.
 * @private {number}
 */
clientState.EXPIRY_MINUTES = 365 * 10 * 24 * 60;

/**
 * Maximum number of lines of code that can be added at once.
 * @private {number}
 */
var MAX_LINES_TO_SAVE = 1000;

/**
 * A special key indicating that the user is not signed in.
 * @const {string}
 */
var ANON_USER_KEY = '';

/**
 * Returns the storage key for the current user.
 * @return {string}
 */
function getStorageBucketForCurrentUser() {
  var userBucket = localStorage.getItem('user_key');
  if (userBucket == ANON_USER_KEY) {
    userBucket = sessionStorage.getItem('anon_key');
  }
  return userBucket;
}

/** Sets the current user to be anonymous. */
clientState.setAnonymousUser = function() {
  clientState.setCurrentUserKey(ANON_USER_KEY);
};

/**
 * Sets the current user storage key, or if key is the empty string, assigns a
 * temporary storage key which will be used only for the current tab.
 * @param key {string} A unique key for the current user, or ANON_USER_KEY.
 */
clientState.setCurrentUserKey = function(key) {
  if (key === null || key === undefined) {
    throw new Error('User key must be defined in setCurrentUserKey.');
  }

  // Do nothing if the key is the same as the current key.
  if (key == localStorage.getItem('user_key')) {
    return;
  }

  // Remember the new key.
  localStorage.setItem('user_key', key);

  // Delete anonymous user state when transitioning to a signed-in user.
  var anonKey = sessionStorage.getItem('anon_key');
  if (anonKey) {
    lscache.setBucket(anonKey);
    lscache.flush();
    sessionStorage.removeItem('anon_key');
  }

  // Generate a random session key if the new current user is anonymous.
  if (key == ANON_USER_KEY) {
    sessionStorage.setItem('anon_key', 'temp_' + Math.random());
  }
};

/**
 * Return true if the user key has been set.
 * @return {boolean}
 */
clientState.isUserKeySet = function() {
  return localStorage.getItem('user_key') !== undefined;
};

/**
 * Applies the lscache storage bucket for the current user.
 * Throws an exception if the current user has not been set.
 */
function applyUserBucket() {
  var bucket = getStorageBucketForCurrentUser();
  if (bucket === undefined) {
    throw new Error('User key must be set before accessing client state.');
  }
  lscache.setBucket(bucket);
}

/**
 * Returns the given item for the current user.
 * @param key {string}
 * @returns {Object}
 */
function getItem(key) {
  applyUserBucket();

  return lscache.get(key);
}

/**
 * Sets the given item for the current user.
 * @param key {string}
 * @param value {Object}
 */
function setItem(key, value) {
  applyUserBucket();
  lscache.set(key, value, clientState.EXPIRY_MINUTES);
}

/***
 * Resets the client state for the current user.
 */
clientState.reset = function() {
  applyUserBucket();
  lscache.flush();
};

/**
 * Get the URL querystring params
 * @param name {string=} Optionally pull a specific param.
 * @return {object|string} Hash of params, or param string if `name` is specified.
 */
clientState.queryParams = function (name) {
  var pairs = location.search.substr(1).split('&');
  var params = {};
  pairs.forEach(function (pair) {
    var split = pair.split('=');
    if (split.length === 2) {
      params[split[0]] = split[1];
    }
  });

  if (name) {
    return params[name];
  }
  return params;
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
  var parsed = getItem(createKey(scriptName, levelId, 'source'));
  if (parsed && (!timestamp || parsed.timestamp > timestamp)) {
    return parsed.source;
  }
  return;  // Return undefined for missing source.
};

/**
 * Cache a copy of the level source along with a timestamp. Posts to /milestone
 * may be queued, so save the data in storage to present a consistent client view.
 * @param {string} scriptName
 * @param {number} levelId
 * @param {number} timestamp
 * @param {string} source
 */
clientState.writeSourceForLevel = function (scriptName, levelId, timestamp, source) {
  setItem(createKey(scriptName, levelId, 'source'), {
    source: source,
    timestamp: timestamp
  });
};

/**
 * Returns the progress attained for the given level.
 * @param {string} scriptName The script name
 * @param {number} levelId The level
 * @returns {number}
 */
clientState.levelProgress = function(scriptName, levelId) {
  var progressMap = clientState.allLevelsProgress();
  return (progressMap[scriptName] || {})[levelId] || 0;
};

/**
 * Returns the "best" of the two results, as defined in apps/src/constants.js.
 * Note that there are negative results that count as an attempt, so we can't
 * just take the maximum.
 * @param {Number} a
 * @param {Number} b
 * @return {Number} The better result.
 */
clientState.mergeActivityResult = function(a, b) {
  a = a || 0;
  b = b || 0;
  if (a === 0) {
    return b;
  }
  if (b === 0) {
    return a;
  }
  return Math.max(a, b);
};

/**
 * Tracks the users progress after they click run
 * @param {boolean} result - Whether the user's solution is successful
 * @param {number} lines - Number of lines of code user wrote in this solution
 * @param {number} testResult - Indicates pass, fail, perfect
 * @param {string} scriptName - Which script this is for
 * @param {number} levelId - Which level this is for
 */
clientState.trackProgress = function(result, lines, testResult, scriptName, levelId) {
  if (result && isFinite(lines)) {
    addLines(lines);
  }

  var savedResult = clientState.levelProgress(scriptName, levelId);
  if (savedResult !== clientState.mergeActivityResult(savedResult, testResult)) {
    setLevelProgress(scriptName, levelId, testResult);
  }
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
  setItem('progress', progressMap);
}

/**
 * Returns a map from (string) level id to progress value.
 * @return {Object<String, number>}
 */
clientState.allLevelsProgress = function() {
  var progressJson = getItem('progress');
  if (progressJson && typeof progressJson == 'object') {
    return progressJson;
  } else {
    // Return empty for missing or malformed progress json.
    return {};
  }
};

/**
 * Returns the number of lines completed.
 * @returns {number}
 */
clientState.lines = function() {
  var linesStr = getItem('lines');
  return isFinite(linesStr) ? Number(linesStr) : 0;
};

/**
 * Adds the given number of completed lines.
 * @param {number} addedLines
 */
function addLines(addedLines) {
  var newLines = Math.min(clientState.lines() + Math.max(addedLines, 0), MAX_LINES_TO_SAVE);
  setItem('lines', String(newLines));
}

/**
 * Returns whether or not the user has seen a given video based on contents of the local storage
 * @param videoId
 * @returns {boolean}
 */
clientState.hasSeenVideo = function(videoId) {
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
clientState.hasSeenCallout = function(calloutId) {
  return hasSeenVisualElement('callout', calloutId);
};

/**
 * Records that a user has seen a given callout in local storage
 * @param calloutId
 */
clientState.recordCalloutSeen = function (calloutId) {
  recordVisualElementSeen('callout', calloutId);
};

/** Sets an arbitrary key and value in the user's storage, for testing only.*/
clientState.setItemForTest = function(key, value) {
  setItem(key, value);
};

/**
 * Private helper for videos and callouts - persists info in the local storage that a given element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function recordVisualElementSeen(visualElementType, visualElementId) {
  var elementSeenMap = getElementSeenMap(visualElementType);
  elementSeenMap[visualElementId] = true;
  setItem(visualElementType, elementSeenMap);
}

/**
 * Private helper for videos and callouts - looks in local storage to see if the element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function hasSeenVisualElement(visualElementType, visualElementId) {
  var elementSeenMap = getElementSeenMap(visualElementType);
  return elementSeenMap[visualElementId] === true;
}

/**
 * Private helper to return the elementSeen map for videos and callouts.
 * @param visualElementType
 * @return Object<string, boolean>
 */
function getElementSeenMap(visualElementType) {
  var elementSeenMap = getItem(visualElementType) || {};
  // Cope with invalid json which lscache returns as a string. (Shouldn't happen unless there is a bug.)
  if (typeof elementSeenMap !== 'object') {
    elementSeenMap = {};
  }
  return elementSeenMap;
}

/**
 * Creates standardized keys for storing values in localStorage.
 * @param {string} scriptName
 * @param {number} levelId
 * @param {string=} prefix
 * @return {string}
 */
function createKey(scriptName, levelId, prefix) {
  return (prefix ? prefix + '_' : '') + scriptName + '_' + levelId;
}

return clientState;

};
