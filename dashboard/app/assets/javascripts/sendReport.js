var lastAjaxRequest;
var lastServerResponse = {};

/**
 * Notify the progression system of level attempt or completion.
 * Provides a response to a callback, which can provide a video to play
 * and next/previous level URLs.
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
var sendReport = function(report) {
  // jQuery can do this implicitly, but when url-encoding it, jQuery calls a method that
  // shows the result dialog immediately
  var queryItems = [];
  for (var key in report) {
    if (report.hasOwnProperty(key) && key != 'onComplete') {
      queryItems.push(key + '=' + report[key]);
    }
  }
  var queryString = queryItems.join('&');

  var thisAjax = jQuery.ajax({
    type: 'POST',
    url: report.callback,
    contentType: 'application/x-www-form-urlencoded',
    data: queryString,
    dataType: 'json',
    beforeSend: function(xhr) {
      xhr.setRequestHeader('X-CSRF-Token', $('meta[name="csrf-token"]').attr('content'))
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
      report['error'] = xhr.responseText;
      reportComplete(report, getFallbackResponse(report));
    }
  });

  lastAjaxRequest = thisAjax;
};

var cancelReport = function() {
  if (lastAjaxRequest) {
    lastAjaxRequest.abort();
  }
  lastAjaxRequest = null;
};

function getFallbackResponse(report) {
  if (!report.fallbackResponse) {
    return null;
  }
  return report.pass ?
            report.fallbackResponse.success :
            report.fallbackResponse.failure;
}

function reportComplete(report, response) {
  lastAjaxRequest = null;
  if (response) {
    lastServerResponse.report_error = report['error'];
    lastServerResponse.nextRedirect = response['redirect'];
    lastServerResponse.previousLevelRedirect = response['previous_level'];
    lastServerResponse.videoInfo = response['video_info'];
  }
  if (report.onComplete) {
    report.onComplete(response);
  }
}
