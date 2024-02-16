import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import FeaturedProjects from '@cdo/apps/templates/projects/FeaturedProjects';

$(document).ready(function () {
  const script = document.querySelector('script[data-featuredprojects]');
  const featuredProjectsData = JSON.parse(script.dataset.featuredprojects);
  const activeFeaturedProjects = featuredProjectsData.active_featured_projects;
  const archivedFeaturedProjects =
    featuredProjectsData.archived_featured_projects;
  const savedFeaturedProjects = featuredProjectsData.saved_featured_projects;

  ReactDOM.render(
    <FeaturedProjects
      activeFeaturedProjects={activeFeaturedProjects}
      savedFeaturedProjects={savedFeaturedProjects}
      archivedFeaturedProjects={archivedFeaturedProjects}
    />,
    document.getElementById('featured-projects-container')
  );
});
