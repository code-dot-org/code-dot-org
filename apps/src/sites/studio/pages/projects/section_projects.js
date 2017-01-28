/**
 * Entry point for projects/section_projects.js bundle
 */

/* globals window */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ProjectsList from '@cdo/apps/templates/projects/ProjectsList';

function renderSection(sectionId) {
  const dataUrl = `/dashboardapi/v1/projects/section/${sectionId}`;
  const element = document.getElementById('projects-list');

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(projectsData => {
    ReactDOM.render(<ProjectsList projectsData={projectsData}/>, element);
  });

  // ReactDOM.render(<ProjectsList projectsData={projectsData}/>, element);
}
window.renderSection = renderSection;
