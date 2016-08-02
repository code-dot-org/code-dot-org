/* global appOptions, dashboard */

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

// Currently just used by LevelGroup.js.
// Called by gotoPage and checkForChanges to save current answers.
// Calls the completeFn function when transmission is complete.
// @param {function(function)} beforeHook Optional callback function to call
//    before saveAnswers gets underway. This function must call the completion
//    function passed as the first parameter to complete the saveAnswers call.
// @param {Number} levelId Optional specific subLevelId that should be changed

function saveAnswers(completeFn, beforeHook, subLevelId) {
  if (beforeHook) {
    beforeHook(sendResultsCompletion, subLevelId);
  } else {
    sendResultsCompletion();
  }
  function sendResultsCompletion() {
    var results = window.getResult();
    var response = results.response;
    var result = results.result;
    var submitted = appOptions.submitted;

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
}

module.exports = {
  saveAnswersAndNavigate: saveAnswersAndNavigate,
  saveAnswers: saveAnswers
};
