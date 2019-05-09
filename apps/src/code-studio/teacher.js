/* global appOptions */

import $ from 'jquery';
import debounce from 'lodash/debounce';
import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore} from './redux';
import SectionSelector from './components/progress/SectionSelector';
import ViewAsToggle from './components/progress/ViewAsToggle';
import TeacherContentToggle from './components/TeacherContentToggle';
import {ViewType, setViewType} from './viewAsRedux';
import {lessonIsLockedForAllStudents} from '@cdo/apps/templates/progress/progressHelpers';
import {getHiddenStages} from './hiddenStageRedux';
import commonMsg from '@cdo/locale';
import {queryLockStatus} from './teacherPanelHelpers';

function resizeScrollable() {
  var newHeight =
    $('.teacher-panel').innerHeight() -
    $('.teacher-panel h3').outerHeight() -
    15 - // magic..
    $('.non-scrollable-wrapper').outerHeight();
  $('.scrollable-wrapper').css('max-height', newHeight);
}

export function onReady() {
  $(window).resize(debounce(resizeScrollable, 250));

  resizeScrollable();

  var submittedTimestamp = $('#submitted .timestamp');
  submittedTimestamp.text(new Date(submittedTimestamp.text()).toLocaleString());

  $('select#sections').change(function(ev) {
    window.location.href = ev.target.value;
  });

  $('#unsubmit').click(function(ev) {
    $.ajax({
      url: $(ev.target).attr('data-user-level-url'),
      method: 'PUT',
      data: {
        user_level: {
          best_result: 1,
          submitted: false
        }
      }
    })
      .done(data => {
        // Let's just refresh so that the dots are correct, etc.
        location.reload();
      })
      .fail(err => console.error(err));
  });

  $('#clear-response').click(ev => {
    $.ajax({
      url: $(ev.target).attr('data-user-level-url'),
      method: 'DELETE'
    })
      .done(data => {
        // Refresh, so that we no longer have the students response loaded
        location.reload();
      })
      .fail(err => console.error(err));
  });

  renderIntoLessonTeacherPanel();
}

/**
 * On a lesson/puzzle page, the teacher panel is not a react component. However,
 * we still have some elements of it that we want to be React/redux backed.
 * Handle those here.
 */
function renderIntoLessonTeacherPanel() {
  const teacherPanelViewAs = document.getElementById('teacher-panel-viewas');
  const stageLockedText = document.getElementById('stage-locked-text');
  const teacherPanelSections = document.getElementById(
    'teacher-panel-sections'
  );

  if (teacherPanelViewAs) {
    renderViewAsToggle(teacherPanelViewAs);
  }

  const store = getStore();
  const scriptId = store.getState().progress.stages[0].script_id;

  renderContentToggle();

  // We depend on having information gathered from querying lockStatus to render
  // these
  queryLockStatus(store, scriptId).then(() => {
    if (teacherPanelSections) {
      renderTeacherPanelSections(teacherPanelSections);
    }

    if (stageLockedText) {
      const state = store.getState();

      const {currentStageId} = state.progress;
      if (lessonIsLockedForAllStudents(currentStageId, state)) {
        $(stageLockedText).text(commonMsg.stageLocked());
      } else {
        $(stageLockedText).text(commonMsg.stageNotFullyLocked());
      }
    }
  });
}

function renderViewAsToggle(element) {
  const store = getStore();

  // Start viewing as teacher
  const query = queryString.parse(location.search);
  const viewAs = query.viewAs || ViewType.Teacher;
  store.dispatch(setViewType(viewAs));

  ReactDOM.render(
    <Provider store={store}>
      <ViewAsToggle />
    </Provider>,
    element
  );
}

function renderTeacherPanelSections(element) {
  ReactDOM.render(
    <Provider store={getStore()}>
      <SectionSelector style={{margin: 10}} reloadOnChange={true} />
    </Provider>,
    element
  );
}

/**
 * We may need to toggle to a locked/hidden stage message when viewing as student
 * Render a content toggle component that does this for us.
 */
function renderContentToggle() {
  if (typeof window.appOptions === 'undefined') {
    // This can happen if student hasn't attempted level
    return;
  }
  // We can remove this element once we get rid of the experiment
  $('#try-it-yourself').hide();

  const levelContent = $('#level-body');
  const element = $('<div/>')
    .css('height', '100%')
    .insertAfter(levelContent)[0];
  const store = getStore();

  const {scriptName} = store.getState().progress;

  store.dispatch(getHiddenStages(scriptName, false));

  ReactDOM.render(
    <Provider store={getStore()}>
      <TeacherContentToggle isBlocklyOrDroplet={!!appOptions.app} />
    </Provider>,
    element
  );
}
