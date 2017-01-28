/**
 * Entry point for projects/section_projects.js bundle
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import ProjectsList from '@cdo/apps/templates/projects/ProjectsList';

$(document).ready(initPage);

function initPage() {
  const script = document.querySelector('script[data-section]');
  const sectionId = JSON.parse(script.dataset.section);
  const dataUrl = `/api/v1/projects/section/${sectionId}`;
  const element = document.getElementById('projects-list');

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(projectsData => {
    ReactDOM.render(<ProjectsList projectsData={projectsData}/>, element);
  });
}
