/* global appOptions */

import $ from 'jquery';
import debounce from 'lodash/debounce';
import queryString from 'query-string';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore } from './redux';
import clientState from './clientState';
import ScriptTeacherPanel from './components/progress/ScriptTeacherPanel';
import SectionSelector from './components/progress/SectionSelector';
import ViewAsToggle from './components/progress/ViewAsToggle';
import TeacherContentToggle from './components/TeacherContentToggle';
import { setSectionLockStatus } from './stageLockRedux';
import { ViewType, setViewType } from './viewAsRedux';
import { lessonIsLockedForAllStudents } from '@cdo/apps/templates/progress/progressHelpers';
import { setSections, selectSection } from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import { getHiddenStages } from './hiddenStageRedux';
import commonMsg from '@cdo/locale';

function resizeScrollable() {
  var newHeight = $('.teacher-panel').innerHeight() -
      $('.teacher-panel h3').outerHeight() -
      15 - // magic..
      $('.non-scrollable-wrapper').outerHeight();
  $('.scrollable-wrapper').css('max-height', newHeight);
}

export function onReady() {
  $(window).resize(debounce(resizeScrollable, 250));

  resizeScrollable();

  var submittedTimestamp = $('#submitted .timestamp');
  submittedTimestamp.text((new Date(submittedTimestamp.text())).toLocaleString());

  $('select#sections').change(function (ev) {
    window.location.href = ev.target.value;
  });

  $('#unsubmit').click(function (ev) {
    $.ajax({
      url: $(ev.target).attr('data-user-level-url'),
      method: 'PUT',
      data: {
        user_level: {
          best_result: 1,
          submitted: false
        }
      }
    }).done(data => {
      // Let's just refresh so that the dots are correct, etc.
      location.reload();
    }).fail(err => console.error(err));
  });

  $("#clear-response").click(ev => {
    $.ajax({
      url: $(ev.target).attr('data-user-level-url'),
      method: 'DELETE'
    }).done(data => {
      // Refresh, so that we no longer have the students response loaded
      location.reload();
    }).fail(err => console.error(err));
  });

  renderIntoLessonTeacherPanel();
}

/**
 * Query the server for lock status of this teacher's students
 * @returns {Promise} when finished
 */
function queryLockStatus(store, scriptId) {
  return new Promise((resolve, reject) => {
    $.ajax(
      '/api/lock_status',
      {
        data: {
          user_id: clientState.queryParams('user_id'),
          script_id: scriptId
        }
      }
    ).done(data => {
      // Extract the state that teacherSectionsRedux cares about
      const teacherSections = Object.values(data).map(section => ({
        id: section.section_id,
        name: section.section_name
      }));

      store.dispatch(setSections(teacherSections));
      store.dispatch(setSectionLockStatus(data));
      const query = queryString.parse(location.search);
      if (query.section_id) {
        store.dispatch(selectSection(query.section_id));
      }
      resolve();
    });
  });
}

/**
 * Render our teacher panel that shows up on our course overview page.
 */
export function renderTeacherPanel(store, scriptId) {
  const div = document.createElement('div');
  div.setAttribute('id', 'teacher-panel-container');
  queryLockStatus(store, scriptId);

  ReactDOM.render(
    <Provider store={store}>
      <ScriptTeacherPanel/>
    </Provider>,
    div
  );
  document.body.appendChild(div);
}

/**
 * On a lesson/puzzle page, the teacher panel is not a react component. However,
 * we still have some elements of it that we want to be React/redux backed.
 * Handle those here.
 */
function renderIntoLessonTeacherPanel() {
  const teacherPanelViewAs = document.getElementById('teacher-panel-viewas');
  const stageLockedText = document.getElementById('stage-locked-text');
  const teacherPanelSections = document.getElementById('teacher-panel-sections');

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



      const { currentStageId } = state.progress;
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
      <ViewAsToggle/>
    </Provider>,
    element
  );
}

function renderTeacherPanelSections(element) {
  ReactDOM.render(
    <Provider store={getStore()}>
      <SectionSelector
        style={{margin: 10}}
        reloadOnChange={true}
      />
    </Provider>,
    element
  );
}

/**
 * We may need to toggle to a locked/hidden stage message when viewing as student
 * Render a content toggle component that does this for us.
 */
function renderContentToggle() {
  if (typeof(window.appOptions) === 'undefined') {
    // This can happen if student hasn't attempted level
    return;
  }
  // We can remove this element once we get rid of the experiment
  $("#try-it-yourself").hide();

  const levelContent = $('#level-body');
  const element = $('<div/>').css('height', '100%').insertAfter(levelContent)[0];
  const store = getStore();

  const { scriptName } = store.getState().progress;

  store.dispatch(getHiddenStages(scriptName, false));

  ReactDOM.render(
    <Provider store={getStore()}>
      <TeacherContentToggle isBlocklyOrDroplet={!!appOptions.app}/>
    </Provider>,
    element
  );
}
