//= require jquery
//= require jquery.cookie
//= require client_state

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
  var progressMap = dashboard.clientState.progressFromCookie();
  return progressMap[String(level)] || 0;
};

/**
 * Sets the progress attained for the given level in the cookie
 * @param {number} level The id of the level
 * @returns {number}
 */
dashboard.clientState.setLevelProgress = function(level, progress) {
  var progressMap = dashboard.clientState.progressFromCookie();
  progressMap[String(level)] = progress;
  $.cookie('progress', JSON.stringify(progressMap),
    {expires: dashboard.clientState.EXPIRY_DAYS});
};

/**
 * Returns the progress hash from (stringified) level id to progress value.
 * @return {Object<String, number>}
 * @private
 */
dashboard.clientState.progressFromCookie = function() {
  var progressJson = $.cookie('progress');
	console.log(progressJson);
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
 * Addeds the number of completed lines.
 * @param {number} addedLines
 */
dashboard.clientState.addLines = function(addedLines) {
  var newLines = dashboard.clientState.lines() + addedLines;
  $.cookie('lines', String(newLines),
    {expires: dashboard.clientState.EXPIRY_DAYS});
};
