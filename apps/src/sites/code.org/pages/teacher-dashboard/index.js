/**
 * Entry point for teacher-dashboard/index.js bundle
 */

import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import SectionProjectsList from '@cdo/apps/templates/projects/SectionProjectsList';

function renderSectionProjects(sectionId) {
  const dataUrl = `/dashboardapi/v1/projects/section/${sectionId}`;
  const element = document.getElementById('projects-list');

  const script = document.querySelector('script[data-studiourlprefix]');
  const studioUrlPrefix = script.dataset.studiourlprefix;

  $.ajax({
    method: 'GET',
    url: dataUrl,
    dataType: 'json'
  }).done(projectsData => {
    ReactDOM.render(
      <SectionProjectsList
        projectsData={projectsData}
        studioUrlPrefix={studioUrlPrefix}
      />,
      element);
  });
}
window.renderSectionProjects = renderSectionProjects;
