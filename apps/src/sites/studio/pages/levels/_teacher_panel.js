import $ from 'jquery';
import {ViewType, setViewType} from '@cdo/apps/code-studio/viewAsRedux';
import queryString from 'query-string';
import {getStore} from '@cdo/apps/redux';

$(document).ready(initPage);

function initPage() {
  const store = getStore();

  initViewAs(store);

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
