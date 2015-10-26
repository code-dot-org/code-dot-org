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
  $.removeCookie('videosSeen', {path: '/'});
};

/**
 * Returns the progress attained for the given level from the cookie.
 * @param {number} level The id of the level
 * @returns {number}
 */
dashboard.clientState.levelProgress = function(level) {
  var progressMap = dashboard.clientState.allLevelsProgress();
  return progressMap[String(level)] || 0;
};

/**
 * Tracks the users progress after they click run
 * @param {boolean} result - Whether the user's solution is successful
 * @param {number} lines - Number of lines of code user wrote in this solution
 * @param {number} testResult - Indicates pass, fail, perfect
 * @param {number} scriptLevelId - Which level this is for
 */
dashboard.clientState.trackProgress = function(result, lines, testResult, scriptLevelId) {
  if (result) {
    addLines(lines);
  }

  if (testResult > dashboard.clientState.levelProgress(scriptLevelId)) {
    setLevelProgress(scriptLevelId, testResult);
  }
};

/**
 * Sets the progress attained for the given level in the cookie
 * @param {number} level The id of the level
 * @returns {number}
 */
function setLevelProgress(level, progress) {
  var progressMap = dashboard.clientState.allLevelsProgress();
  progressMap[String(level)] = progress;
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
  var elementSeenJson = localStorage.getItem(visualElementType) || '{}';

  try {
    var elementSeen = JSON.parse(elementSeenJson);
    elementSeen[visualElementId] = true;
    localStorage.setItem(visualElementType, JSON.stringify(elementSeen));
  } catch (e) {
    //Something went wrong parsing the json. Blow it up and just put in the new callout
    var elementSeen = {};
    elementSeen[visualElementId] = true;
    localStorage.setItem(visualElementType, JSON.stringify(elementSeen));
  }
}

/**
 * Private helper for videos and callouts - looks in local storage to see if the element has been seen
 * @param visualElementType
 * @param visualElementId
 */
function hasSeenVisualElement(visualElementType, visualElementId) {
  var elementSeenJson = localStorage.getItem(visualElementType) || '{}';
  try {
    var elementSeen = JSON.parse(elementSeenJson);
    return elementSeen[visualElementId] === true;
  } catch (e) {
    return false;
  }
}

/**
 * Queries the server for updated script progress for the current user and
 * merges it into the current clientState.
 *
 * @param scriptId
 * @returns jquery request object
 */
dashboard.clientState.refreshScriptProgressFromServer = function (scriptId) {
  var req = $.post("/milestone/script_progress/" + scriptId);
  req.done(function (responseJSON) {
    mergeLevelProgress(responseJSON.levels);
  });
  return req;
};

/**
 * Given an object mapping level_id to status, merge it into clientState.
 * In the case that there is a conflict, take the better of the two status.
 *
 * @param levelProgress
 */
function mergeLevelProgress(newLevelProgress) {
  var currentLevelProgress = dashboard.clientState.allLevelsProgress();

  $.each(newLevelProgress, function (levelId, result) {
    if(!currentLevelProgress[levelId] || currentLevelProgress[levelId] < result) {
      setLevelProgress(levelId, result);
    }
  });
}

})(window, $);
