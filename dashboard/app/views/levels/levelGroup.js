/* global appOptions, Dialog */

function initLevelGroup(
  levelCount,
  page,
  fallbackResponse,
  callback,
  app,
  level,
  lastAttempt) {

  // Are we read-only?  This can be because we're a teacher OR because an answer
  // has been previously submitted.
  if (window.appOptions.readonlyWorkspace)
  {
    // hide the Submit button.
    $('.submitButton').hide();

    // Are we a student viewing their own previously-submitted work?
    if (window.appOptions.submitted)
    {
      // show the Unsubmit button.
      $('.unsubmitButton').show();
    }
  }

  window.getResult = function()
  {
    // Construct an array of all the level results.
    // When submitted it's something like this:
    //
    //   [{"level_id":1977,"result":"0"},{"level_id":2007,"result":"3"},{"level_id":1939,"result":"2,1"}]
    //

    // Add any new results to the existing lastAttempt results.
    for (var i = 0; i < levelCount; i++)
    {
      var multiName = "multi_" + i;
      var multiResult = window[multiName].getCurrentAnswer().toString();
      var levelId = window[multiName].getLevelId();

      // But before storing, if we had a previous result for the same level,
      // remove that from the array, since we want to overwrite that previous
      // answer.
      for (var j = lastAttempt.length - 1; j >= 0; j--)
      {
        if (lastAttempt[j].level_id == levelId)
        {
          lastAttempt.splice(j, 1);
        }
      }

      lastAttempt.push({level_id: levelId, result: multiResult});
    }

    var response = JSON.stringify(lastAttempt);


    var forceSubmittable = window.location.search.indexOf("force_submittable") !== -1;

    var result;
    var submitted;

    if (window.appOptions.level.submittable || this.forceSubmittable)
    {
      result = true;
      submitted = true;
    }
    else
    {
      result = true; // this.validateAnswers();
      submitted = false;
    }

    return {
      "response": response,
      "result": true,
      "errorType": null,
      "submitted": submitted
    };
  };

  $(".nextPageButton").click($.proxy(function(event) {

    // Submit what we have, and when that's done, go to the next page of the
    // long assessment.

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
      onComplete: function () {
        var newLocation = window.location.href.replace("/page/" + (page+1), "/page/" + (page+2));
        window.location.href = newLocation;
      }
    });
  }, this));

  // Unsubmit button should only be available when this is a standalone Multi.
  $('.unsubmitButton').click(function() {

    var dialog = new Dialog({
      body:
        '<div class="modal-content no-modal-icon">' +
          '<p class="dialog-title">Unsubmit answer</p>' +
          '<p class="dialog-body">' +
          'This will unsubmit your last answer.' +
          '</p>' +
          '<button id="continue-button">Okay</button>' +
          '<button id="cancel-button">Cancel</button>' +
        '</div>'
    });

    var dialogDiv = $(dialog.div);
    dialog.show();

    dialogDiv.find('#continue-button').click(function () {
      $.post(window.appOptions.unsubmitUrl,
        {"_method": 'PUT', user_level: {submitted: false}},
        function(data)
        {
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
