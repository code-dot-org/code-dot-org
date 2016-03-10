/* global levelCount, page, fallbackResponse, callback, app, level, lastAttempt */

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

  return {
    "response": response,
    "result": true,
    "errorType": null
  };
};

$(document).ready(function() {
  $(".nextPageButton").click($.proxy(function(event) {

    // Submit what we have, and when that's done, go to the next page of the
    // long assessment.

    var results = window.getResult();
    var response = results.response;
    var result = results.result;
    var errorType = results.errorType;

    sendReport({
      program: response,
      fallbackResponse: fallbackResponse,
      callback: callback,
      app: app,
      level: level,
      result: result,
      pass: result,
      testResult: result ? 100 : 0,
      onComplete: function () {
        var newLocation = window.location.href.replace("/page/" + (page+1), "/page/" + (page+2));
        window.location.href = newLocation;
      }
    });
  }, this));
});
