var annotationList = require('../acemode/annotationList');

var ErrorLevel = {
  WARNING: 'WARNING',
  ERROR: 'ERROR'
};

function outputApplabConsole(output) {
  function stringifyNonStrings(object) {
    if (typeof object === 'string' || object instanceof String) {
      return object;
    } else {
      return JSON.stringify(object);
    }
  }

  // first pass through to the real browser console log if available:
  if (console.log) {
    console.log(output);
  }
  // then put it in the applab console visible to the user:
  var debugOutput = document.getElementById('debug-output');
  if (debugOutput) {
    if (debugOutput.textContent.length > 0) {
      debugOutput.textContent += '\n';
    }
    debugOutput.textContent += stringifyNonStrings(output);

    debugOutput.scrollTop = debugOutput.scrollHeight;
  }
}

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
  outputApplabConsole(text);
  if (lineNum !== undefined) {
    annotationList.addRuntimeAnnotation(level, lineNum, warning);
  }
}

function handleError(opts, message) {
  // Ensure that this event was requested by the same instance of the interpreter
  // that is currently active before proceeding...
  if (opts.onError && opts.JSInterpreter === Applab.JSInterpreter) {
    Applab.JSInterpreter.queueEvent(opts.onError, [message]);
  } else {
    outputApplabConsole(message);
  }
}


module.exports = {
  ErrorLevel: ErrorLevel,
  outputApplabConsole: outputApplabConsole,
  outputError: outputError,
  handleError: handleError
};
