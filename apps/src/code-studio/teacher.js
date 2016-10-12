import $ from 'jquery';
import debounce from 'lodash/debounce';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore } from './redux';
import clientState from './clientState';
import ScriptTeacherPanel from './components/progress/ScriptTeacherPanel';
import { fullyLockedStageMapping } from './stageLockRedux';
import { setSections } from './sectionsRedux';
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

  setStageLockedText();
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
 * On puzzle page, update text in teacher panel (which is not a React component)
 * stating whether this stage is locked for all students or not.
 */
function setStageLockedText() {
  const element = $('#stage-locked-text');
  if (element.length === 0) {
    return;
  }

  const store = getStore();
  const scriptId = store.getState().progress.stages[0].script_id;
  queryLockStatus(store, scriptId).then(() => {
    const state = store.getState();

    const { currentStageId } = state.progress;
    const { selectedSectionId } = state.sections;
    const fullyLocked = fullyLockedStageMapping(state.stageLock.bySection[selectedSectionId]);

    if (fullyLocked[currentStageId]) {
      element.text(commonMsg.stageLocked());
    } else {
      element.text(commonMsg.stageNotFullyLocked());
    }
  });
}
