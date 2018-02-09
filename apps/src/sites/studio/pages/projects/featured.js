import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import FeaturedProjects from '@cdo/apps/templates/projects/FeaturedProjects';

$(document).ready(function () {
  const script = document.querySelector('script[data-featuredprojects]');
  const featuredProjectsData = JSON.parse(script.dataset.featuredprojects);
  const currentFeaturedProjects = featuredProjectsData.currently_featured_projects;
  const archivedUnfeaturedProjects = featuredProjectsData.archived_unfeatured_projects;

  ReactDOM.render(
    <FeaturedProjects
      currentFeaturedProjects={currentFeaturedProjects}
      archivedUnfeaturedProjects={archivedUnfeaturedProjects}
    />,
    document.getElementById('featured-projects-container')
  );
});
