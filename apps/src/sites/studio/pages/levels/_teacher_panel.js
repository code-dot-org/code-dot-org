/* global appOptions */

import $ from 'jquery';
import {ViewType, setViewType} from '@cdo/apps/code-studio/viewAsRedux';
import queryString from 'query-string';
import {getStore} from '@cdo/apps/redux';
import React from 'react';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';
import TeacherContentToggle from '@cdo/apps/code-studio/components/TeacherContentToggle';

$(document).ready(initPage);

function initPage() {
  const store = getStore();

  initViewAs(store);
  renderTeacherContentToggle(store);

  const teacherPanel = document.getElementById('level-teacher-panel');
  if (teacherPanel) {
    console.log('found #level-teacher-panel');
  }
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

  ReactDOM.render(
    <Provider store={getStore()}>
      <TeacherContentToggle isBlocklyOrDroplet={!!appOptions.app} />
    </Provider>,
    element
  );
}
