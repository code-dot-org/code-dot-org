/* globals dashboard, appOptions  */

window.dashboard = window.dashboard || {};

window.dashboard.progress = (function () {
  var progress = {};

  /**
   * See ApplicationHelper#activity_css_class.
   * @param result
   * @return {string}
   */
  progress.activityCssClass = function (result) {
    if (!result) {
      return 'not_tried';
    }
    if (result >= 1000) {
      return 'submitted';
    }
    if (result >= 30) {
      return 'perfect';
    }
    if (result >= 20) {
      return 'passed';
    }
    return 'attempted';
  };

  /**
   * Returns the "best" of the two results, as defined in apps/src/constants.js.
   * Note that there are negative results that count as an attempt, so we can't
   * just take the maximum.
   * @param {Number} a
   * @param {Number} b
   * @return {string} The result css class.
   */
  progress.mergedActivityCssClass = function (a, b) {
    return progress.activityCssClass(dashboard.clientState.mergeActivityResult(a, b));
  };

  progress.populateProgress = function (scriptName) {
    // Render the progress the client knows about (from sessionStorage)
    var clientProgress = dashboard.clientState.allLevelsProgress()[scriptName] || {};
    Object.keys(clientProgress).forEach(function (levelId) {
      $('#level-' + levelId).addClass(progress.activityCssClass(clientProgress[levelId]));
    });

    $.ajax('/api/user_progress/' + scriptName).done(function (data) {
      // Merge progress from server (loaded via AJAX)
      var serverProgress = (data || {}).levels || {};
      Object.keys(serverProgress).forEach(function (levelId) {
        if (serverProgress[levelId].result !== clientProgress[levelId]) {
          var status = progress.mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId].result);

          // Clear the existing class and replace
          $('#level-' + levelId).attr('class', 'level_link ' + status);

          // Write down new progress in sessionStorage
          dashboard.clientState.trackProgress(null, null, serverProgress[levelId].result, scriptName, levelId);
        }
      });
    });

    // Highlight the current level
    if (window.appOptions && appOptions.serverLevelId) {
      $('#level-' + appOptions.serverLevelId).parent().addClass('puzzle_outer_current');
    }
  };

  return progress;
})();
