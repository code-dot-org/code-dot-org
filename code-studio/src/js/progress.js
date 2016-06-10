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
  var lastLevelId = null;
  var levelRepeat = 0;

  var combinedProgress = stageData.levels.map(function (scriptlevel, index) {
    var levelId = progress.bestResultLevelId(scriptlevel.ids, serverProgress, clientProgress);

    // If we have a multi-page level, then we will encounter the same level ID
    // multiple times in a row.  Keep track of how many times we've seen it
    // repeat, so that we know what page we're up to.
    if (levelId === lastLevelId) {
      levelRepeat++;
    } else {
      lastLevelId = levelId;
      levelRepeat = 0;
    }

    var status;
    var result = (serverProgress[levelId] || {}).result;
    if (serverProgress && result > clientState.MAXIMUM_CACHABLE_RESULT) {
      if (result === REVIEW_REJECTED_RESULT) {
        status = 'review_rejected';
      }
      if (result === REVIEW_ACCEPTED_RESULT) {
        status = 'review_accepted';
      }
    } else if (serverProgress && serverProgress[levelId] && serverProgress[levelId].submitted) {
      status = "submitted";
    } else if (serverProgress && serverProgress[levelId] && serverProgress[levelId].pages_completed) {
      // The dot is considered perfect if the page is considered complete.
      var pageCompleted = serverProgress[levelId].pages_completed[levelRepeat];
      status = progress.activityCssClass(pageCompleted);
    } else if (clientState.queryParams('user_id')) {
      // Show server progress only (the student's progress)
      status = progress.activityCssClass(result);
    } else {
      // Merge server progress with local progress
      status = progress.mergedActivityCssClass(result, clientProgress[levelId]);
    }

    var href = scriptlevel.url + location.search;

    return {
      title: scriptlevel.title,
      status: status,
      kind: scriptlevel.kind,
      url: href,
      icon: scriptlevel.icon,
      uid: scriptlevel.uid,
      id: levelId
    };
  });

  var mountPoint = document.createElement('div');
  mountPoint.style.display = 'inline-block';
  $('.progress_container').replaceWith(mountPoint);
  ReactDOM.render(React.createElement(StageProgress, {
    levels: combinedProgress,
    currentLevelId: currentLevelId,
    saveAnswersFirst: puzzlePage !== progress.PUZZLE_PAGE_NONE
  }), mountPoint);
};

progress.renderCourseProgress = function (scriptData, currentLevelId) {
  var store = loadProgress(scriptData, currentLevelId);
  var mountPoint = document.createElement('div');

  $.ajax(
    '/api/user_progress/' + scriptData.name,
    { data: { user_id: clientState.queryParams('user_id') } }
  ).done(data => {
    data = data || {};

    // Show lesson plan links if teacher
    if (data.isTeacher) {
      store.dispatch({
        type: 'SHOW_LESSON_PLAN_LINKS'
      });
    }

    if (data.focusAreaPositions) {
      store.dispatch({
        type: 'UPDATE_FOCUS_AREAS',
        changeFocusAreaPath: data.changeFocusAreaPath,
        focusAreaPositions: data.focusAreaPositions
      });
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

// Return the level with the highest progress, or the first level if none have
// been attempted
progress.bestResultLevelId = function (levelIds, serverProgress, clientProgress) {
  // The usual case
  if (levelIds.length === 1) {
    return levelIds[0];
  }

  // Return the level with the highest result
  var attemptedIds = levelIds.filter(id => serverProgress[id] || clientProgress[id]);
  if (attemptedIds.length === 0) {
    // None of them have been attempted, just return the first
    return levelIds[0];
  }
  var bestId = attemptedIds[0];
  var bestResult = clientState.mergeActivityResult(serverProgress[bestId], clientProgress[bestId]);
  attemptedIds.forEach(function (id) {
    var result = clientState.mergeActivityResult(serverProgress[id], clientProgress[id]);
    if (result > bestResult) {
      bestId = id;
      bestResult = result;
    }
  });
  return bestId;
};

function loadProgress(scriptData, currentLevelId) {

  let store = createStore((state = [], action) => {
    if (action.type === 'MERGE_PROGRESS') {
      let newProgress = {};
      return {
        currentLevelId: state.currentLevelId,
        professionalLearningCourse: state.professionalLearningCourse,
        progress: newProgress,
        changeFocusAreaPath: state.changeFocusAreaPath,
        focusAreaPositions: state.focusAreaPositions,
        showLessonPlanLinks: state.showLessonPlanLinks,
        stages: state.stages.map(stage => Object.assign({}, stage, {levels: stage.levels.map(level => {
          let id = level.uid || progress.bestResultLevelId(level.ids, state.progress, action.progress);
          newProgress[id] = clientState.mergeActivityResult(state.progress[id], action.progress[id]);

          return Object.assign({}, level, {status: progress.activityCssClass(newProgress[id]), id: id});
        })}))
      };
    } else if (action.type === 'UPDATE_FOCUS_AREAS') {
      return Object.assign(state, {
        changeFocusAreaPath: action.changeFocusAreaPath,
        focusAreaPositions: action.focusAreaPositions
      });
    } else if (action.type === 'SHOW_LESSON_PLAN_LINKS') {
      return Object.assign(state, {
        showLessonPlanLinks: action.showLessonPlanLinks
      });
    }
    return state;
  }, {
    currentLevelId: currentLevelId,
    professionalLearningCourse: scriptData.plc,
    progress: {},
    changeFocusAreaPath: null,
    focusAreaPositions: [],
    showLessonPlanLinks: false,
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
