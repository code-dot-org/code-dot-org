import React from 'react';
import ReactDOM from 'react-dom';
import PlcHeader from '@cdo/apps/code-studio/plc/header';
import { renderCourseProgress } from '@cdo/apps/code-studio/progress';

window.dashboard = window.dashboard || {};

const scriptOverview = window.dashboard.scriptOverview = {};

scriptOverview.renderPlcBreadcrumb = function (props, element) {
  ReactDOM.render(
    <PlcHeader {...props}/>,
    element
  );
};

scriptOverview.renderCourseProgress = function (scriptData) {
  renderCourseProgress(scriptData);
};
