//= require jquery
//= require jquery.cookie

/* global dashboard */

/**
 * Helper functions for accessing client state. This state is now stored
 * in client side cookies but may eventually migrate to HTML5 web
 * storage. It currently consists of level progress and the line count;
 * in the future we will add support for videos seeen, callouts, and
 * scripts accessed.
 */
(function (window, $) {

if (!window.dashboard) {
  window.dashboard = {};
}

dashboard.clientState = {};

/**
 * Number of days before client state cookie expires.
 * @type {number}
 * @private
 */
dashboard.clientState.EXPIRY_DAYS = 365;

/**
 * Maximum number of lines of code that can be stored in the cookie
 * @type {number}
 * @private
 */
var MAX_LINES_TO_SAVE = 1000;

var COOKIE_OPTIONS = {expires: dashboard.clientState.EXPIRY_DAYS, path: '/'};

dashboard.clientState.reset = function() {
  $.removeCookie('progress', {path: '/'});
  $.removeCookie('lines', {path: '/'});
  sessionStorage.clear();
};

/**
 * Returns the client-cached copy of the level source for the given script
 * level, if it's newer than the given timestamp.
 * @param {string} scriptLevelKey
 * @param {number=} timestamp
 * @returns {string|undefined} Cached copy of the level source, or undefined if
 *   the cached copy is missing/stale.
 */
dashboard.clientState.sourceForLevel = function (scriptLevelKey, timestamp) {
  var data = sessionStorage.getItem('source_' + scriptLevelKey);
  if (data) {
    try {
      var parsed = JSON.parse(data);
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
 * @param {string} scriptLevelKey
 * @param {number} timestamp
 * @param {string} source
 */
dashboard.clientState.writeSourceForLevel = function (scriptLevelKey, timestamp, source) {
  try {
    sessionStorage.setItem('source_' + scriptLevelKey, JSON.stringify({
      source: source,
      timestamp: timestamp
    }));
  } catch (e) {
    if (e.name !== "QuotaExceededError") {
      throw e;
    }
  }
};

/**
 * Returns the progress attained for the given level from the cookie.
 * @param {string} scriptLevelKey The script level
 * @returns {number}
 */
dashboard.clientState.levelProgress = function(scriptLevelKey) {
  var progressMap = dashboard.clientState.allLevelsProgress();
  return progressMap[scriptLevelKey] || 0;
};

/**
 * Tracks the users progress after they click run
 * @param {boolean} result - Whether the user's solution is successful
 * @param {number} lines - Number of lines of code user wrote in this solution
 * @param {number} testResult - Indicates pass, fail, perfect
 * @param {string} scriptLevelKey - Which script level this is for
 */
dashboard.clientState.trackProgress = function(result, lines, testResult, scriptLevelKey) {
  if (result) {
    addLines(lines);
  }

  if (testResult > dashboard.clientState.levelProgress(scriptLevelKey)) {
    setLevelProgress(scriptLevelKey, testResult);
  }
};

/**
 * Sets the progress attained for the given level in the cookie
 * @param {string} scriptLevelKey The script level
 * @param {number} progress Indicates pass, fail, perfect
 * @returns {number}
 */
function setLevelProgress(scriptLevelKey, progress) {
  var progressMap = dashboard.clientState.allLevelsProgress();
  progressMap[scriptLevelKey] = progress;
  $.cookie('progress', JSON.stringify(progressMap), COOKIE_OPTIONS);
}

/**
 * Returns a map from (string) level id to progress value.
 * @return {Object<String, number>}
 */
dashboard.clientState.allLevelsProgress = function() {
  var progressJson = $.cookie('progress');
  try {
    return progressJson ? JSON.parse(progressJson) : {};
  } catch(e) {
    // Recover from malformed cookies.
    return {};
  }
};

/**
 * Returns the number of lines completed from the cookie.
 * @returns {number}
 */
dashboard.clientState.lines = function() {
  var linesStr = $.cookie('lines');
  return linesStr ? Number(linesStr) : 0;
};

/**
 * Adds the given number of completed lines.
 * @param {number} addedLines
 */
function addLines(addedLines) {
  var newLines = Math.min(dashboard.clientState.lines() + Math.max(addedLines, 0), MAX_LINES_TO_SAVE);

  $.cookie('lines', String(newLines), COOKIE_OPTIONS);
}

/**
 * Returns whether or not the user has seen a given video based on contents of the local storage
 * @param videoId
 * @returns {*}
 */
dashboard.clientState.hasSeenVideo = function(videoId) {
  return hasSeenVisualElement('video', videoId);
};

/**
 * Records that a user has seen a given video in local storage
 * @param videoId
 */
dashboard.clientState.recordVideoSeen = function (videoId) {
  recordVisualElementSeen('video', videoId);
};

/**
 * Returns whether or not the user has seen the given callout based on contents of the local storage
 * @param calloutId
 * @returns {boolean}
 */
dashboard.clientState.hasSeenCallout = function(calloutId) {
  return hasSeenVisualElement('callout', calloutId);
};

/**
 * Records that a user has seen a given callout in local storage
 * @param calloutId
 */
dashboard.clientState.recordCalloutSeen = function (calloutId) {
  recordVisualElementSeen('callout', calloutId);
};

/**
 * Private helper for videos and callouts - persists info in the local storage that a given element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function recordVisualElementSeen(visualElementType, visualElementId) {
  var elementSeenJson = sessionStorage.getItem(visualElementType) || '{}';

  try {
    var elementSeen = JSON.parse(elementSeenJson);
    elementSeen[visualElementId] = true;
    sessionStorage.setItem(visualElementType, JSON.stringify(elementSeen));
  } catch (e) {
    if (e.name === "QuotaExceededError") {
      return ;
    }
    //Something went wrong parsing the json. Blow it up and just put in the new callout
    var elementSeen = {};
    elementSeen[visualElementId] = true;
    sessionStorage.setItem(visualElementType, JSON.stringify(elementSeen));
  }
}

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

})(window, $);
