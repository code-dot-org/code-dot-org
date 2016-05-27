/* globals appOptions  */
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import _ from 'lodash';
import clientState from './clientState';
import StageProgress from './components/progress/stage_progress.jsx';
import CourseProgress from './components/progress/course_progress.jsx';

var progress = module.exports;

/**
 * See ActivityConstants.
 */
const MINIMUM_PASS_RESULT = 20;
const MINIMUM_OPTIMAL_RESULT = 30;
const SUBMITTED_RESULT = 1000;
const REVIEW_REJECTED_RESULT = 1500;
const REVIEW_ACCEPTED_RESULT = 2000;

/**
 * See ApplicationHelper#activity_css_class.
 * @param result
 * @return {string}
 */
progress.activityCssClass = function (result) {
  if (!result) {
    return 'not_tried';
  }
  if (result === SUBMITTED_RESULT) {
    return 'submitted';
  }
  if (result >= MINIMUM_OPTIMAL_RESULT) {
    return 'perfect';
  }
  if (result >= MINIMUM_PASS_RESULT) {
    return 'passed';
  }
  return 'attempted';
};

/**
 * See ApplicationHelper::PUZZLE_PAGE_NONE.
 */
progress.PUZZLE_PAGE_NONE = -1;

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

progress.renderStageProgress = function (stageData, progressData, clientProgress, currentLevelId, puzzlePage) {
  var serverProgress = progressData.levels || {};
  var currentLevelIndex = null;
  var lastLevelId = null;
  var levelRepeat = 0;

  var combinedProgress = stageData.levels.map(function (level, index) {
    // Determine the current level index.
    // However, because long assessments can have the same level appearing
    // multiple times, just set this the first time it's determined.
    if (level.id === currentLevelId && currentLevelIndex === null) {
      currentLevelIndex = index;
    }

    // If we have a multi-page level, then we will encounter the same level ID
    // multiple times in a row.  Keep track of how many times we've seen it
    // repeat, so that we know what page we're up to.
    if (level.id === lastLevelId) {
      levelRepeat++;
    } else {
      lastLevelId = level.id;
      levelRepeat = 0;
    }

    var status;
    var result = (serverProgress[level.id] || {}).result;
    if (serverProgress && result > clientState.MAXIMUM_CACHABLE_RESULT) {
      if (result === REVIEW_REJECTED_RESULT) {
        status = 'review_rejected';
      }
      if (result === REVIEW_ACCEPTED_RESULT) {
        status = 'review_accepted';
      }
    } else if (serverProgress && serverProgress[level.id] && serverProgress[level.id].submitted) {
      status = "submitted";
    } else if (serverProgress && serverProgress[level.id] && serverProgress[level.id].pages_completed) {
      // The dot is considered perfect if the page is considered complete.
      var pageCompleted = serverProgress[level.id].pages_completed[levelRepeat];
      status = pageCompleted ? "perfect" : "attempted";
    } else if (clientState.queryParams('user_id')) {
      // Show server progress only (the student's progress)
      status = progress.activityCssClass(result);
    } else {
      // Merge server progress with local progress
      status = progress.mergedActivityCssClass(result, clientProgress[level.id]);
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

  if (currentLevelIndex !== null && puzzlePage !== progress.PUZZLE_PAGE_NONE) {
    currentLevelIndex += puzzlePage - 1;
  }

  var mountPoint = document.createElement('div');
  mountPoint.style.display = 'inline-block';
  $('.progress_container').replaceWith(mountPoint);
  ReactDOM.render(React.createElement(StageProgress, {
    levels: combinedProgress,
    currentLevelIndex: currentLevelIndex,
    saveAnswersFirst: puzzlePage !== progress.PUZZLE_PAGE_NONE
  }), mountPoint);
};

progress.renderCourseProgress = function (scriptData) {
  var store = loadProgress(scriptData);
  var mountPoint = document.createElement('div');

  $.ajax('/api/user_progress/' + scriptData.name).done(data => {
    data = data || {};

    // Show lesson plan links if teacher
    if (data.isTeacher) {
      $('.stage-lesson-plan-link').show();
    }

    // Merge progress from server (loaded via AJAX)
    if (data.levels) {
      store.dispatch({
        type: 'MERGE_PROGRESS',
        progress: _.mapValues(data.levels, level => level.submitted ? SUBMITTED_RESULT : level.result)
      });
    }
  });

  $('.user-stats-block').prepend(mountPoint);
  ReactDOM.render(
    <Provider store={store}>
      <CourseProgress />
    </Provider>,
    mountPoint
  );
};

function loadProgress(scriptData) {
  var teacherCourse = $('#landingpage').hasClass('teacher-course');

  let store = createStore((state = [], action) => {
    if (action.type === 'MERGE_PROGRESS') {
      let newProgress = {};
      return {
        display: state.display,
        progress: newProgress,
        stages: state.stages.map(stage => _.assign({}, stage, {levels: stage.levels.map(level => {
          let id = level.uid || level.id;
          newProgress[id] = clientState.mergeActivityResult(state.progress[id], action.progress[id]);

          return _.assign({}, level, {status: progress.activityCssClass(newProgress[id])});
        })}))
      };
    }
    return state;
  }, {
    display: teacherCourse ? 'list' : 'dots',
    progress: {},
    stages: scriptData.stages
  });

  // Merge in progress saved on the client.
  store.dispatch({
    type: 'MERGE_PROGRESS',
    progress: clientState.allLevelsProgress()[scriptData.name] || {}
  });

  // Progress from the server should be written down locally.
  store.subscribe(() => {
    clientState.batchTrackProgress(scriptData.name, store.getState().progress);
  });

  return store;
}
