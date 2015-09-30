//= require jquery
//= require jquery.cookie

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

dashboard.clientState.reset = function() {
  $.removeCookie('progress');
  $.removeCookie('lines');
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
 * Sets the progress attained for the given level in the cookie
 * @param {number} level The id of the level
 * @returns {number}
 */
dashboard.clientState.setLevelProgress = function(level, progress) {
  var progressMap = dashboard.clientState.allLevelsProgress();
  progressMap[String(level)] = progress;
  $.cookie('progress', JSON.stringify(progressMap),
    {expires: dashboard.clientState.EXPIRY_DAYS});
};

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
dashboard.clientState.addLines = function(addedLines) {
  var newLines = dashboard.clientState.lines() + addedLines;
  $.cookie('lines', String(newLines),
    {expires: dashboard.clientState.EXPIRY_DAYS});
};
})(window, $);
