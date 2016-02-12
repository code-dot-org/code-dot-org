/**
 * @file Helper functions for accessing client state. This state is stored on a per-user basis
 * HTML5 web storage.
 */
'use strict';

var lscache = require('lscache');

module.exports = function () {

var clientState = {};

/**
 * Max number of minutes before client state expires.
 * @type {number}
 * @private
 */
clientState.EXPIRY_MINUTES = 365 * 24 * 60;

/**
 * Maximum number of lines of code that can be added at once.
 * @type {number}
 * @private
 */
var MAX_LINES_TO_SAVE = 1000;

var userKey = null;

/**
 * Sets the current user key to `key`, or if key is null, to a UUID which will be used for the
 * lifetime of the current tab.
 * @param key {string}
 */
clientState.setCurrentUserKey = function(key) {
  if (!key) {
    if (sessionStorage.getItem('is_temp_key') != 'true') {
      sessionStorage.setItem('is_temp_key', 'true');
      sessionStorage.setItem('user_key', 'temp_' + Math.random());
    }
  } else {
    // Delete anonymous user state when transitioning to a signed-in user.
    if (sessionStorage.getItem('is_temp_key') == 'true') {
      clientState.reset();
    }
    sessionStorage.setItem('is_temp_key', 'false');
    sessionStorage.setItem('user_key', key);
  }
  console.log("Set key to " + clientState.getUserKey());
};

/**
 * Return true if the user key has been set.
 */
clientState.isUserKeySet = function() {
  return !!sessionStorage.getItem('user_key');
};

clientState.getUserKey = function() {
  var key = sessionStorage.getItem('user_key');
  if (!key) {
    throw 'User key not set, setCurrentUserKey must be called first.';
  }
  return key;
};

function applyUserBucket() {
  lscache.setBucket(clientState.getUserKey());
}

function getItem(key) {
  applyUserBucket();
  return lscache.get(key);
}

/**
 * Don't throw storage errors in Safari private browsing mode.
 */
function safelySetItem(key, value) {
  applyUserBucket();
  try {
    lscache.set(key, value, clientState.EXPIRY_MINUTES);
  } catch (e) {
    if (e.name !== "QuotaExceededError") {
      throw e;
    }
  }
}


/***
 * Resets the state of the current user
 */
clientState.reset = function() {
  applyUserBucket();
  lscache.flush();
};

/***
 * Resets the state of all users, for testing only.
 */
clientState.resetAllForTest = function() {
  localStorage.clear();
  clientState.setCurrentUserKey(null);
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
  try {
    var parsed = getItem(createKey(scriptName, levelId, 'source'));
    if (parsed && (!timestamp || parsed.timestamp > timestamp)) {
      return parsed.source;
    }
  } catch (e) {
  }
  return;  // Return undefined for invalid or missing source.
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
  safelySetItem(createKey(scriptName, levelId, 'source'), {
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
  safelySetItem('progress', progressMap);
}

/**
 * Returns a map from (string) level id to progress value.
 * @return {Object<String, number>}
 */
clientState.allLevelsProgress = function() {
  var progressJson = getItem('progress');
  try {
    return progressJson ? progressJson : {};
  } catch(e) {
    // Recover from malformed data.
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
  safelySetItem('lines', String(newLines));
}

/**
 * Returns whether or not the user has seen a given video based on contents of the local storage
 * @param videoId
 * @returns {*}
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
  safelySetItem(key, value);
};

/**
 * Private helper for videos and callouts - persists info in the local storage that a given element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function recordVisualElementSeen(visualElementType, visualElementId) {
  var elementSeenJson = getItem(visualElementType) || {};
  var elementSeen;
  try {
    elementSeen = elementSeenJson;
    elementSeen[visualElementId] = true;
    safelySetItem(visualElementType, elementSeen);
  } catch (e) {
    //Something went wrong parsing the json. Blow it up and just put in the new callout
    elementSeen = {};
    elementSeen[visualElementId] = true;
    safelySetItem(visualElementType, elementSeen);
  }
}

/**
 * Private helper for videos and callouts - looks in local storage to see if the element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function hasSeenVisualElement(visualElementType, visualElementId) {
  var elementSeenJson = getItem(visualElementType) || {};
  try {
    var elementSeen = elementSeenJson;
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

return clientState;

};
