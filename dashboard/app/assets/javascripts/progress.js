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

  progress.populateClientProgress = function(scriptName) {
    // Render the progress the client knows about (from sessionStorage)
    var clientProgress = dashboard.clientState.allLevelsProgress()[scriptName] || {};
    Object.keys(clientProgress).forEach(function (levelId) {
      $('.level-' + levelId).addClass(progress.activityCssClass(clientProgress[levelId]));
    });
    return clientProgress;
  };

  progress.populateProgress = function (scriptName) {

    var userKeyAlreadySet = dashboard.clientState.isUserKeySet();
    var clientProgress;
    if (userKeyAlreadySet) {
      clientProgress = progress.populateClientProgress(scriptName);
    }

    $.ajax('/api/user_progress/' + scriptName).done(function (data) {
      data = data || {};
      if (data.user_id) {
        dashboard.clientState.setCurrentUserKey(data.user_id);
      } else {
        dashboard.clientState.setAnonymousUser();
      }
      if (!userKeyAlreadySet) {
        clientProgress = progress.populateClientProgress(scriptName);
      }

      // Show lesson plan links if teacher
      if (data.isTeacher) {
        $('.stage-lesson-plan-link').show();
      }

      // Merge progress from server (loaded via AJAX)
      var serverProgress = data.levels || {};
      Object.keys(serverProgress).forEach(function (levelId) {
        if (serverProgress[levelId].result !== clientProgress[levelId]) {
          var status = progress.mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId].result);

          // Clear the existing class and replace
          $('.level-' + levelId).attr('class', 'level_link ' + status);

          // Write down new progress in sessionStorage
          dashboard.clientState.trackProgress(null, null, serverProgress[levelId].result, scriptName, levelId);
        }
      });
    });

    // Highlight the current level
    if (window.appOptions && appOptions.serverLevelId) {
      $('.level-' + appOptions.serverLevelId).parent().addClass('puzzle_outer_current');
    }
  };

  progress.renderStageProgress = function (stageData, progressData, clientProgress, currentLevelId) {
    var serverProgress = progressData.levels || {};
    var currentLevelIndex = null;

    var combinedProgress = stageData.levels.map(function(level, index) {
      if (level.id === currentLevelId) {
        currentLevelIndex = index;
      }

      var status;
      if (dashboard.clientState.queryParams('user_id')) {
        // Show server progress only (the student's progress)
        status = dashboard.progress.activityCssClass((serverProgress[level.id] || {}).result);
      } else {
        // Merge server progress with local progress
        status = dashboard.progress.mergedActivityCssClass((serverProgress[level.id] || {}).result, clientProgress[level.id]);
      }
      var href = level.url + location.search;

      return {
        title: level.title,
        status: status,
        kind: level.kind,
        url: href,
        id: level.id
      };
    });

    $('.progress_container').replaceWith(React.renderToStaticMarkup(React.createElement(dashboard.StageProgress, {
      levels: combinedProgress,
      currentLevelIndex: currentLevelIndex
    })));
  };

  progress.renderCourseProgress = function (scriptData) {
    $('.user-stats-block').prepend(React.renderToStaticMarkup(React.createElement(dashboard.CourseProgress, {
      stages: scriptData.stages
    })));
    progress.populateProgress(scriptData.name);
  };

  return progress;
})();
