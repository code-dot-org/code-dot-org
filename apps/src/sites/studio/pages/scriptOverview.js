import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';
import { setVerifiedResources } from '@cdo/apps/code-studio/verifiedTeacherRedux';
import { getStore } from '@cdo/apps/code-studio/redux';

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

  renderCourseProgress(scriptData);
}

function renderPlcBreadcrumb(props, element) {
  ReactDOM.render(
    <PlcHeader {...props}/>,
    element
  );
}
