/* globals dashboard, appOptions  */

var clientState = require('./clientState');

var progress = module.exports;

/**
 * See ApplicationHelper#activity_css_class.
 * @param result
 * @return {string}
 */
progress.activityCssClass = function (result) {
  if (!result) {
    return 'not_tried';
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
  return progress.activityCssClass(clientState.mergeActivityResult(a, b));
};

progress.populateProgress = function (scriptName) {
  // Render the progress the client knows about (from sessionStorage)
  var clientProgress = clientState.allLevelsProgress()[scriptName] || {};
  Object.keys(clientProgress).forEach(function (levelId) {
    $('.level-' + levelId).addClass(progress.activityCssClass(clientProgress[levelId]));
  });

  $.ajax('/api/user_progress/' + scriptName).done(function (data) {
    data = data || {};

    // Show lesson plan links if teacher
    if (data.isTeacher) {
      $('.stage-lesson-plan-link').show();
    }

    // Merge progress from server (loaded via AJAX)
    var serverProgress = data.levels || {};
    Object.keys(serverProgress).forEach(function (levelId) {
      // Only the server can speak to whether a level is submitted.  If it is,
      // we show the submitted styling.
      if (serverProgress[levelId].submitted) {
        // Clear the existing class and replace
        $('.level-' + levelId).attr('class', 'level_link submitted');
      } else if (serverProgress[levelId].result !== clientProgress[levelId]) {
        var status = progress.mergedActivityCssClass(clientProgress[levelId], serverProgress[levelId].result);

        // Clear the existing class and replace
        $('.level-' + levelId).attr('class', 'level_link ' + status);

        // Write down new progress in sessionStorage
        clientState.trackProgress(null, null, serverProgress[levelId].result, scriptName, levelId);
      }
    });
  });

  // Highlight the current level
  if (window.appOptions && appOptions.serverLevelId) {
    $('.level-' + appOptions.serverLevelId).parent().addClass('puzzle_outer_current');
  }
};

progress.renderStageProgress = function (stageData, progressData, clientProgress, currentLevelId, puzzlePage) {
  var serverProgress = progressData.levels || {};
  var currentLevelIndex = null;

  var combinedProgress = stageData.levels.map(function(level, index) {
    // Determine the current level index.
    // However, because long assessments can have the same level appearing
    // multiple times, just set this the first time it's determined.
    if (level.id === currentLevelId && currentLevelIndex === null) {
       currentLevelIndex = index;
    }

    var status;
    if (serverProgress && serverProgress[level.id] && serverProgress[level.id].submitted) {
      status = "submitted";
    } else if (clientState.queryParams('user_id')) {
      // Show server progress only (the student's progress)
      status = progress.activityCssClass((serverProgress[level.id] || {}).result);
    } else {
      // Merge server progress with local progress
      status = progress.mergedActivityCssClass((serverProgress[level.id] || {}).result, clientProgress[level.id]);
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

  if (currentLevelIndex !== null && puzzlePage !== -1) {
    currentLevelIndex += puzzlePage - 1;
  }

  var mountPoint = document.createElement('div');
  mountPoint.style.display = 'inline-block';
  $('.progress_container').replaceWith(mountPoint);
  ReactDOM.render(React.createElement(dashboard.StageProgress, {
    levels: combinedProgress,
    currentLevelIndex: currentLevelIndex
  }), mountPoint);
};

progress.renderCourseProgress = function (scriptData) {
  var mountPoint = document.createElement('div');
  $('.user-stats-block').prepend(mountPoint);
  ReactDOM.render(React.createElement(dashboard.CourseProgress, {
    stages: scriptData.stages
  }), mountPoint);
  progress.populateProgress(scriptData.name);
};
