/* global appOptions, Dialog */

import $ from 'jquery';
require('./multi.js');
require('./textMatch.js');
var saveAnswers = require('./saveAnswers.js').saveAnswers;

window.initLevelGroup = function (
  levelCount,
  currentPage,
  lastAttempt) {

  // Whenever an embedded level notifies us that the user has made a change,
  // check for any changes in the response set, and if so, attempt to save
  // these answers.  Saving is throttled to not occur more than once every 20
  // seconds, and is done as soon as possible ("leading edge"), as well as at
  // the end of a 20 second period if a change was made before then ("trailing
  // edge").  Any pending throttled calls are cancelled when we go to a new page
  // and save for that reason.

  window.getResult = getResult;

  function submitSublevelResults(completion, subLevelIdChanged) {
    var levels = window.levelGroup.levels;
    var sendReportCompleteCount = 0;
    var subLevelCount = Object.keys(levels).length;
    if (subLevelCount === 0) {
      return completion();
    }
    function handleSublevelComplete() {
      sendReportCompleteCount++;
      if (sendReportCompleteCount === subLevelCount) {
        completion();
      }
    }
    for (var subLevelId in levels) {
      if (typeof subLevelIdChanged !== 'undefined' && subLevelIdChanged !== parseInt(subLevelId)) {
        // Only one sublevel changed and this is not the one, so skip the post and
        // call the completion function immediately
        handleSublevelComplete();
        continue;
      }
      var subLevelResult = levels[subLevelId].getResult(true);
      var response = subLevelResult.response;
      var result = subLevelResult.result;
      var errorType = subLevelResult.errorType;
      var testResult = subLevelResult.testResult ? subLevelResult.testResult : (result ? 100 : 0);
      var submitted = subLevelResult.submitted || false;

      window.dashboard.reporting.sendReport({
        program: response,
        fallbackResponse: appOptions.dialog.fallbackResponse,
        callback: appOptions.dialog.sublevelCallback + subLevelId,
        app: levels[subLevelId].getAppName(),
        allowMultipleSends: true,
        level: subLevelId,
        result: subLevelResult,
        pass: subLevelResult,
        testResult: testResult,
        submitted: submitted,
        onComplete: handleSublevelComplete
      });
    }
  }

  var throttledSaveAnswers =
    window.dashboard.utils.throttle(saveAnswers.bind(this, null, submitSublevelResults), 20 * 1000, {'leading': true, 'trailing': true});

  var lastResponse = window.getResult().response;

  window.levelGroup.answerChangedFn = function (levelId) {
    var currentResponse = window.getResult().response;
    if (lastResponse !== currentResponse) {
      throttledSaveAnswers(levelId);
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
      var currentAnswer = levels[levelId].getResult(true);
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

    var completeString = (validCount === levelCount) ? "complete" : "incomplete";
    var showConfirmationDialog = "levelgroup-submit-" + completeString;

    return {
      "response": JSON.stringify(lastAttempt),
      "result": true,
      "errorType": null,
      "submitted": window.appOptions.level.submittable || forceSubmittable,
      "showConfirmationDialog": showConfirmationDialog,
      "beforeProcessResultsHook": submitSublevelResults
    };
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
          },
          submitSublevelResults);
    }
  }

  $(".nextPageButton").click(function (event) {
    gotoPage(currentPage+1);
  });

  $(".previousPageButton").click(function (event) {
    gotoPage(currentPage-1);
  });
};
