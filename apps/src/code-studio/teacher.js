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
import { fullyLockedStageMapping, ViewType, setViewType } from './stageLockRedux';
import { setSections, selectSection } from './sectionsRedux';
import { getHiddenStages } from './hiddenStageRedux';
import commonMsg from '@cdo/locale';
import experiments from '@cdo/apps/experiments';

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
      user_level: {
        best_result: 1,
        submitted: false
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
      store.dispatch(setSections(data));
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
  if (teacherPanelViewAs && experiments.isEnabled('viewAsToggle')) {
    renderViewAsToggle(teacherPanelViewAs);
  }

  if (!stageLockedText && !teacherPanelSections) {
    return;
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
      renderStageLockedText(stageLockedText);
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
      <SectionSelector reloadOnChange={true}/>
    </Provider>,
    element
  );
}

function renderStageLockedText(element) {
  const state = getStore().getState();

  const { currentStageId } = state.progress;
  const { selectedSectionId } = state.sections;
  const fullyLocked = fullyLockedStageMapping(state.stageLock.stagesBySectionId[selectedSectionId]);

  if (fullyLocked[currentStageId]) {
    $(element).text(commonMsg.stageLocked());
  } else {
    $(element).text(commonMsg.stageNotFullyLocked());
  }
}

/**
 * We may need to toggle to a locked/hidden stage message when viewing as student
 * Render a content toggle component that does this for us.
 */
function renderContentToggle() {
  if (experiments.isEnabled('viewAsToggle')) {

    $("#try-it-yourself").hide();

    const levelContent = $('#level-body');
    const element = $('<div/>').insertAfter(levelContent)[0];
    const store = getStore();

    const { scriptName } = store.getState().progress;

    store.dispatch(getHiddenStages(scriptName));

    ReactDOM.render(
      <Provider store={getStore()}>
        <TeacherContentToggle/>
      </Provider>,
      element
    );
  } else {
    // In our haml, we set the opacity of level body with the intention of letting
    // TeacherContentToggle whether or not it's visible. Since we're not using
    // that here, just make it visible again
    $('#level-body').css('opacity', '');
  }
}
