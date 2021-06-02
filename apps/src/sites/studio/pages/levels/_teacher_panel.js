/* global appOptions */

import $ from 'jquery';
import {setViewType, ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import queryString from 'query-string';
import {getStore} from '@cdo/apps/redux';
import React from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import TeacherContentToggle from '@cdo/apps/code-studio/components/TeacherContentToggle';
import {getHiddenLessons} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {
  renderTeacherPanel,
  queryLockStatus
} from '@cdo/apps/code-studio/teacherPanelHelpers';
import {setVerified} from '@cdo/apps/code-studio/verifiedTeacherRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-teacherpanel]');
  const teacherPanelData = JSON.parse(script.dataset.teacherpanel);

  const store = getStore();

  initViewAs(store);
  queryLockStatus(
    store,
    teacherPanelData.script_id,
    teacherPanelData.page_type
  );
  store.dispatch(getHiddenLessons(teacherPanelData.script_name, false));
  if (teacherPanelData.is_verified_teacher) {
    store.dispatch(setVerified());
  }
  // Stage Extras fail to load with this
  if (!teacherPanelData.lesson_extra) {
    renderTeacherContentToggle(store);
  }
  renderTeacherPanel(
    store,
    teacherPanelData.script_id,
    teacherPanelData.section,
    teacherPanelData.script_name,
    teacherPanelData,
    teacherPanelData.page_type
  );
}

function initViewAs(store) {
  const query = queryString.parse(location.search);
  const initialViewAs = query.viewAs || ViewType.Teacher;
  store.dispatch(setViewType(initialViewAs));
}

function renderTeacherContentToggle(store) {
  const levelContent = $('#level-body');
  const element = $('<div/>')
    .css('height', '100%')
    .insertAfter(levelContent)[0];
  const isBlocklyOrDroplet = !!(window.appOptions && appOptions.app);

  ReactDOM.render(
    <Provider store={getStore()}>
      <TeacherContentToggle isBlocklyOrDroplet={isBlocklyOrDroplet} />
    </Provider>,
    element
  );
}
