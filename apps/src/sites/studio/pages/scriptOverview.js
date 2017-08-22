import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';
import { registerReducers } from '@cdo/apps/redux';

import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);

  const { scriptData, plcBreadcrumb } = config;

  registerReducers({teacherSections});

  if (plcBreadcrumb) {
    renderPlcBreadcrumb(plcBreadcrumb, document.getElementById('breadcrumb'));
  }

  renderCourseProgress(scriptData);
}

function renderPlcBreadcrumb(props, element) {
  ReactDOM.render(
    <PlcHeader {...props}/>,
    element
  );
}
