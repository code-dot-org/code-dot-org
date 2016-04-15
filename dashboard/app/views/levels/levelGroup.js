/* global appOptions, Dialog */

function initLevelGroup(
  levelCount,
  currentPage,
  fallbackResponse,
  callback,
  app,
  level,
  lastAttempt) {

  // Are we read-only?  This can be because we're a teacher OR because an answer
  // has been previously submitted.
  if (window.appOptions.readonlyWorkspace) {
    // hide the Submit button.
    $('.submitButton').hide();

    // Are we a student viewing their own previously-submitted work?
    if (window.appOptions.submitted) {
      // show the Unsubmit button.
      $('.unsubmitButton').show();
    }

    // Set the entire page background to be light grey.
    $('.full_container').addClass("level_group_readonly");
  }


  // Whenever an embedded level notifies us that the user has made a change,
  // check for any changes in the response set, and if so, attempt to save
  // these answers.  Saving is throttled to not occur more than once every 20
  // seconds, and is done as soon as possible ("leading edge"), as well as at
  // the end of a 20 second period if a change was made before then ("trailing
  // edge").  Any pending throttled calls are cancelled when we go to a new page
  // and save for that reason.

  this.throttledSaveAnswers =
    window.dashboard.utils.throttle(saveAnswers, 20 * 1000, {'leading': true, 'trailing': true});

  var lastResponse = null;

  window.answerChangedFn = function () {
    var currentResponse = window.getResult().response;
    if (lastResponse !== null && lastResponse !== currentResponse) {
      this.throttledSaveAnswers();
    }
    lastResponse = currentResponse;
  };

  /**
   * Construct an array of all the level results. When submitted it's something
   * like this:
   *
   * [{"level_id":1977,"result":"0","valid":true},
   *  {"level_id":2007,"result":"-1","valid":false},
   *  {"level_id":1939,"result":"2,1","valid":true}]
   */
  window.getResult = function () {
    // Add any new results to the existing lastAttempt results.
    var levels = window.levelGroup.levels;
    var validCount = 0;
    Object.keys(levels).forEach(function (levelId) {
      var currentAnswer = levels[levelId].getCurrentAnswer();
      var levelResult = currentAnswer.response.toString();
      var valid = currentAnswer.valid;
      lastAttempt[levelId] = {result: levelResult, valid: valid};
      if (valid) {
        validCount++;
      }
    });

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
  };

  // Called by gotoPage and checkForChanges to save current answers.
  // Calls the completeFn function when transmission is complete.
  function saveAnswers(completeFn) {
    var results = window.getResult();
    var response = results.response;
    var result = results.result;
    var errorType = results.errorType;
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
      this.throttledSaveAnswers.cancel();
      saveAnswers(function () {
        changePage(targetPage);
      });
    }
  }

  $(".nextPageButton").click($.proxy(function (event) {
    gotoPage(currentPage+1);
  }, this));

  $(".previousPageButton").click($.proxy(function (event) {
    gotoPage(currentPage-1);
  }, this));

  // Unsubmit button should only be available when this is a standalone level.
  $('.unsubmitButton').click(function () {
    var content = document.querySelector("#unsubmit-dialogcontent").cloneNode(true);
    var dialog = new window.Dialog({body: content});
    var dialogDiv = $(dialog.div);
    dialog.show();

    var okButton = dialogDiv.find('#ok-button');
    okButton.click(function () {
      // Avoid multiple simultaneous unsubmissions.
      okButton.attr('disabled', true);

      $.post(window.appOptions.unsubmitUrl,
        {"_method": 'PUT', user_level: {submitted: false}},
        function () {
          // Just reload so that the progress in the header is shown correctly.
          location.reload();
        }
      );
    });

    dialogDiv.find('#cancel-button').click(function () {
      dialog.hide();
    });
  });
}
