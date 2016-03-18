/* global appOptions */

var clientState = require('./clientState');

var lastAjaxRequest;
var lastServerResponse = {};

/**
 * Notify the progression system of level attempt or completion.
 * Provides a response to a callback, which can provide a video to play
 * and next/previous level URLs.
 *
 * The client posts the progress JSON to the URL specified by
 * report.callback (e.g. /milestone). In the event of a failure or timeout,
 * the client relies on report.fallbackResponse (if specified) to allow
 * the user to progress.
 *
 * @param {Object} report
 * @param {string} report.callback - The url where the report should be sent.
 *        For studioApp-based levels, this is provided on initialization as
 *        appOptions.report.callback.
 * @param {Object} report.fallbackResponse - ??? I'm not sure ???
 *        For studioApp-based levels, this is provided on initialization as
 *        appOptions.report.fallback_response
 * @param {string} report.app - The app name, as defined by its model.
 * @param {string} report.level - The level name or number.  Maybe deprecated?
 * @param {number|boolean} report.result - Whether the attempt succeeded or failed.
 * @param {number} report.testResult - Additional detail on the outcome of the
 *        attempt. Standard responses seem to be zero for failures or one
 *        hundred for success.
 * @param {function} report.onComplete - Callback invoked when reporting is
 *        completed.  Is passed a single 'response' argument which contains
 *        information about what to do / where to go next.
 */
var reporting = module.exports;

reporting.getLastServerResponse = function () {
  return lastServerResponse;
};

reporting.sendReport = function(report) {
  // jQuery can do this implicitly, but when url-encoding it, jQuery calls a method that
  // shows the result dialog immediately
  var queryItems = [];
  for (var key in report) {
    if (report.hasOwnProperty(key) && key != 'onComplete') {
      queryItems.push(key + '=' + report[key]);
    }
  }
  var queryString = queryItems.join('&');

  clientState.trackProgress(report.result, report.lines, report.testResult, appOptions.scriptName, appOptions.serverLevelId);

  //Post milestone iff the server tells us, or if we are on the last level and have passed
  if (appOptions.postMilestone || (appOptions.level.puzzle_number && appOptions.level.puzzle_number === appOptions.level.stage_total && report.pass)) {

    var thisAjax = jQuery.ajax({
      type: 'POST',
      url: report.callback,
      contentType: 'application/x-www-form-urlencoded',
      // Set a timeout of fifteen seconds so the user will get the fallback
      // response even if the server is hung and unresponsive.
      timeout: 15000,
      data: queryString,
      dataType: 'json',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'));
      },
      success: function (response) {
        if (thisAjax !== lastAjaxRequest) {
          return;
        }
        reportComplete(report, response);
      },
      error: function (xhr, textStatus, thrownError) {
        if (thisAjax !== lastAjaxRequest) {
          return;
        }
        report.error = xhr.responseText;
        reportComplete(report, getFallbackResponse(report));
      }
    });

    lastAjaxRequest = thisAjax;
  } else {
    //There's a potential race condition here - we show the dialog after animation completion, but also after the report
    //is done posting. There is logic that says "don't show the dialog if we are animating" but if milestone posting
    //is disabled then we might show the dialog before the animation starts. Putting a 1-sec delay works around this
    setTimeout(function () {
      reportComplete(report, getFallbackResponse(report));
    }, 1000);
  }

};

reporting.cancelReport = function() {
  if (lastAjaxRequest) {
    lastAjaxRequest.abort();
  }
  lastAjaxRequest = null;
};

function getFallbackResponse(report) {
  if (!report.fallbackResponse) {
    return null;
  }
  var fallbackResponse = maybeParse(report.fallbackResponse);
  return report.pass ? fallbackResponse.success : fallbackResponse.failure;
}

// TODO: sometimes fallback response is a string, not a parsed object
function maybeParse(data) {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (e) {}
  }
  return data;
}

function reportComplete(report, response) {
  lastAjaxRequest = null;
  if (response) {
    lastServerResponse.report_error = report.error;
    lastServerResponse.nextRedirect = response.redirect;
    lastServerResponse.previousLevelRedirect = response.previous_level;
    lastServerResponse.videoInfo = response.video_info;
  }
  if (report.onComplete) {
    report.onComplete(response);
  }
}
