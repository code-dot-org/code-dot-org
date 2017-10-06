import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';
import { setVerifiedResources } from '@cdo/apps/code-studio/verifiedTeacherRedux';
import { getStore } from '@cdo/apps/code-studio/redux';
import Notification, { NotificationType } from '@cdo/apps/templates/Notification';
import i18n from '@cdo/locale';

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
      <Notification
        type={NotificationType.information}
        notice="This course has recently been updated!"
        details="See what changed and how it may affect your classroom."
        buttonText={i18n.learnMore()}
        buttonLink="https://support.code.org/hc/en-us/articles/115001931251"
        dismissible={true}
        isRtl={false}
        width={1100}
      />,
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
