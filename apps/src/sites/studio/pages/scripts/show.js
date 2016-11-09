import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-scriptoverview]');
  const config = JSON.parse(script.dataset.scriptoverview);

  const { scriptData, plcBreadcrumb } = config;

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
