/**
 * Entry point for projectsList.js bundle
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ProjectsList from '@cdo/apps/templates/projects/ProjectsList';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-projectsListData]');
  const projectsData = JSON.parse(script.dataset.projectslistdata);
  const element = document.getElementById('projects-list');

  ReactDOM.render(React.createElement(ProjectsList, {projectsData}), element);
}

