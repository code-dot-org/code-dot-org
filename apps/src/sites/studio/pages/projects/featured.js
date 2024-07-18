import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import FeaturedProjects from '@cdo/apps/templates/projects/FeaturedProjects';

$(document).ready(function () {
  const script = document.querySelector('script[data-featuredprojects]');
  const featuredProjectsData = JSON.parse(script.dataset.featuredprojects);
  const activeFeaturedProjects = featuredProjectsData.active;
  const archivedFeaturedProjects = featuredProjectsData.archived;
  const bookmarkedFeaturedProjects = featuredProjectsData.bookmarked;

  const root = createRoot(
    document.getElementById('featured-projects-container')
  );

  root.render(
    <FeaturedProjects
      activeFeaturedProjects={activeFeaturedProjects}
      bookmarkedFeaturedProjects={bookmarkedFeaturedProjects}
      archivedFeaturedProjects={archivedFeaturedProjects}
    />
  );
});
