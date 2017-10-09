import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';
import { setVerifiedResources } from '@cdo/apps/code-studio/verifiedTeacherRedux';
import { getStore } from '@cdo/apps/code-studio/redux';
import TeacherNotification from '@cdo/apps/code-studio/components/progress/TeacherNotification';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);

  const { scriptData, plcBreadcrumb } = config;
  const store = getStore();

  if (plcBreadcrumb) {
    renderPlcBreadcrumb(plcBreadcrumb, document.getElementById('breadcrumb'));
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

function renderPlcBreadcrumb(props, element) {
  ReactDOM.render(
    <PlcHeader {...props}/>,
    element
  );
}
