var annotationList = require('../acemode/annotationList');
var logToCloud = require('../logToCloud');

var ErrorLevel = {
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

// Rate at which we log errors to the cloud
var ERROR_LOG_RATE = 1 / 100;

/**
 * Output error to console and gutter as appropriate
 * @param {string} warning Text for warning
 * @param {ErrorLevel} level
 * @param {number} lineNum One indexed line number
 */
function outputError(warning, level, lineNum) {
  var text = level + ': ';
  if (lineNum !== undefined) {
    text += 'Line: ' + lineNum + ': ';
  }
  text += warning;
  Applab.log(text);
  if (lineNum !== undefined) {
    annotationList.addRuntimeAnnotation(level, lineNum, warning);
  }

  // Send up to New Relic if it meets our sampling rate
  if (level === ErrorLevel.ERROR && Math.random() < ERROR_LOG_RATE) {
    logToCloud.addPageAction(logToCloud.PageAction.UserJavaScriptError, warning);
  }
}

function handleError(opts, message) {
  if (opts.onError) {
    opts.onError.call(null, message);
  } else {
    Applab.log(message);
  }
}


module.exports = {
  ErrorLevel: ErrorLevel,
  outputError: outputError,
  handleError: handleError
};
