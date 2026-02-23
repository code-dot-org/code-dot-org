import $ from 'jquery';
import React from 'react';

import FeaturedProjects from '@cdo/apps/templates/projects/FeaturedProjects';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';

$(document).ready(function () {
  const script = document.querySelector('script[data-featuredprojects]');
  const featuredProjectsData = JSON.parse(script.dataset.featuredprojects);
  const activeFeaturedProjects = featuredProjectsData.active;
  const archivedFeaturedProjects = featuredProjectsData.archived;
  const bookmarkedFeaturedProjects = featuredProjectsData.bookmarked;

  createReactRoot(
    <FeaturedProjects
      activeFeaturedProjects={activeFeaturedProjects}
      bookmarkedFeaturedProjects={bookmarkedFeaturedProjects}
      archivedFeaturedProjects={archivedFeaturedProjects}
    />,
    document.getElementById('featured-projects-container')
  );
});
