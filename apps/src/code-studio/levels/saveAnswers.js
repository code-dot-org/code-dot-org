/* global appOptions */
import { getResult } from './codeStudioLevels';

// The external web page might tell us to save our progress and then navigate
// to a new URL when that's done.  This is done when the level dots are
// pressed.
function saveAnswersAndNavigate(url) {
  if (window.appOptions.readonlyWorkspace) {
    window.location.href = url;
  } else {
    saveAnswers(function () {
      window.location.href = url;
    });
  }
}

const UNSUBMITTED_ATTEMPT = -50;

// Calls the completeFn function when transmission is complete.

/**
 * @param {function} completeFn - Function to call after sending report to
 *   save answers.
 */
function saveAnswers(completeFn) {
  var results = getResult();
  var response = results.response;
  var result = results.result;
  var submitted = appOptions.submitted || false;

  window.dashboard.reporting.sendReport({
    program: response,
    fallbackResponse: appOptions.dialog.fallbackResponse,
    callback: appOptions.dialog.callback,
    app: appOptions.dialog.app,
    level: appOptions.levelPosition,
    result: result,
    pass: result,
    testResult: result ? UNSUBMITTED_ATTEMPT : 0,
    submitted: submitted,
    onComplete: completeFn
  });
}

module.exports = {
  saveAnswersAndNavigate: saveAnswersAndNavigate,
  saveAnswers: saveAnswers
};
