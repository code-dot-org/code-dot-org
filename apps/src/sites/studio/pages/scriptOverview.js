import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';
import { setVerifiedResources } from '@cdo/apps/code-studio/verifiedTeacherRedux';
import { getStore } from '@cdo/apps/code-studio/redux';
import { registerReducers } from '@cdo/apps/redux';
import TeacherNotification from '@cdo/apps/code-studio/components/progress/TeacherNotification';
import plcHeaderReducer, { setPlcHeader } from '@cdo/apps/code-studio/plc/plcHeaderRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);

  const { scriptData, plcBreadcrumb } = config;
  const store = getStore();

  if (plcBreadcrumb) {
    // Dispatch breadcrumb props so that ScriptOverviewHeader can add the breadcrumb
    // as appropriate
    registerReducers({plcHeader: plcHeaderReducer});
    store.dispatch(setPlcHeader(plcBreadcrumb.unit_name, plcBreadcrumb.course_view_path));
  }

  if (scriptData.has_verified_resources) {
    store.dispatch(setVerifiedResources(true));
  }

  // This notification is a temporary hack we want to stick on a few courses. We
  // expect to remove it in the near future, and build a longer term solution
  // for adding notifications to specific scripts that is LB based.
  const announcementCourses = [
    'coursee',
    'coursef',
    'express'
  ];

  if (announcementCourses.includes(scriptData.name)) {
    ReactDOM.render(
      <Provider store={store}>
        <TeacherNotification/>
      </Provider>,
      document.getElementById('notification')
    );
  }
  renderCourseProgress(scriptData);
}
