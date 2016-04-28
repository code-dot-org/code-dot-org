/* global appOptions, Dialog */

require('./multi.js');
require('./textMatch.js');

window.initLevelGroup = function (
  levelCount,
  currentPage,
  fallbackResponse,
  callback,
  app,
  level,
  lastAttempt) {

  // Whenever an embedded level notifies us that the user has made a change,
  // check for any changes in the response set, and if so, attempt to save
  // these answers.  Saving is throttled to not occur more than once every 20
  // seconds, and is done as soon as possible ("leading edge"), as well as at
  // the end of a 20 second period if a change was made before then ("trailing
  // edge").  Any pending throttled calls are cancelled when we go to a new page
  // and save for that reason.

  window.getResult = getResult;

  var throttledSaveAnswers =
    window.dashboard.utils.throttle(saveAnswers, 20 * 1000, {'leading': true, 'trailing': true});

  var lastResponse = window.getResult().response;

  window.levelGroup.answerChangedFn = function () {
    var currentResponse = window.getResult().response;
    if (lastResponse !== currentResponse) {
      throttledSaveAnswers();
    }
    lastResponse = currentResponse;
  };

  /**
   * Construct an array of all the level results. When submitted it's something
   * like this:
   *
   * {"1977": {"result": "0", "valid": true},
   *  "2007": {"result": "-1", "valid": false},
   *  "1939": {"result": "2,1", "valid": true}}
   */
  function getResult() {
    // Add any new results to the existing lastAttempt results.
    var levels = window.levelGroup.levels;
    Object.keys(levels).forEach(function (levelId) {
      var currentAnswer = levels[levelId].getCurrentAnswer();
      var levelResult = currentAnswer.response.toString();
      var valid = currentAnswer.valid;
      lastAttempt[levelId] = {result: levelResult, valid: valid};
    });

    var validCount = 0;
    for (var level in lastAttempt) {
      if (lastAttempt[level].valid) {
        validCount ++;
      }
    }

    var forceSubmittable = window.location.search.indexOf("force_submittable") !== -1;

    var completeString = (validCount == levelCount) ? "complete" : "incomplete";
    var showConfirmationDialog = "levelgroup-submit-" + completeString;

    return {
      "response": JSON.stringify(lastAttempt),
      "result": true,
      "errorType": null,
      "submitted": window.appOptions.level.submittable || forceSubmittable,
      "showConfirmationDialog": showConfirmationDialog
    };
  }

  // Called by gotoPage and checkForChanges to save current answers.
  // Calls the completeFn function when transmission is complete.
  function saveAnswers(completeFn) {
    var results = window.getResult();
    var response = results.response;
    var result = results.result;
    var submitted = appOptions.submitted;

    window.dashboard.reporting.sendReport({
      program: response,
      fallbackResponse: fallbackResponse,
      callback: callback,
      app: app,
      level: level,
      result: result,
      pass: result,
      testResult: result ? 100 : 0,
      submitted: submitted,
      onComplete: completeFn
    });
  }

  // Called by gotoPage when it's ready to actually change the page.
  function changePage(targetPage) {
    var newLocation = window.location.href.replace("/page/" + currentPage, "/page/" + targetPage);
    window.location.href = newLocation;
  }

  // Called by previous/next button handlers.
  // Goes to a new page, first saving current answers if necessary.
  function gotoPage(targetPage) {
    // Are we read-only?  This can be because we're a teacher OR because an answer
    // has been previously submitted.
    if (window.appOptions.readonlyWorkspace) {
      changePage(targetPage);
    } else {
      // Submit what we have, and when that's done, go to the next page of the
      // long assessment.  Cancel any pending throttled attempts at saving state.
      throttledSaveAnswers.cancel();
      saveAnswers(function () {
        changePage(targetPage);
      });
    }
  }

  $(".nextPageButton").click(function (event) {
    gotoPage(currentPage+1);
  });

  $(".previousPageButton").click(function (event) {
    gotoPage(currentPage-1);
  });
};
