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
import CurrentSection from './components/progress/CurrentSection';
import TeacherPanelStudentList from './components/TeacherPanelStudentList';
import { fullyLockedStageMapping } from './stageLockRedux';
import { setSections, selectSection } from './sectionsRedux';
import commonMsg from '@cdo/locale';

// TODO - move to react ?
// TODO - this should also happen on initial render
function resizeScrollable() {
  var newHeight = $('.teacher-panel').innerHeight() -
      $('.teacher-panel h3').outerHeight() -
      15 - // magic..
      5 - // height of border
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
  const stageLockedText = document.getElementById('stage-locked-text');
  const teacherPanelSections = document.getElementById('teacher-panel-sections');
  const studentList = document.getElementById('react-students-list');
  if (!stageLockedText && !teacherPanelSections) {
    return;
  }

  const store = getStore();
  const scriptId = store.getState().progress.stages[0].script_id;

  // We depend on having information gathered from querying lockStatus to render
  // these
  queryLockStatus(store, scriptId).then(() => {
    if (teacherPanelSections) {
      ReactDOM.render(
        <Provider store={getStore()}>
          <div>
            <CurrentSection/>
            <SectionSelector/>
          </div>
        </Provider>,
        teacherPanelSections
      );
    }

    if (studentList) {
      const studentInfo = $("#students_info").data('studentsInfo');
      const query = queryString.parse(location.search);
      ReactDOM.render(
        <Provider store={getStore()}>
          <TeacherPanelStudentList
            studentInfo={studentInfo}
            activeUserId={query.user_id}
          />
        </Provider>,
        studentList
      );
    }

    if (stageLockedText) {
      const state = store.getState();

      const { currentStageId } = state.progress;
      const { selectedSectionId } = state.sections;
      const fullyLocked = fullyLockedStageMapping(state.stageLock.stagesBySectionId[selectedSectionId]);

      if (fullyLocked[currentStageId]) {
        $(stageLockedText).text(commonMsg.stageLocked());
      } else {
        $(stageLockedText).text(commonMsg.stageNotFullyLocked());
      }
    }
  });
}
