import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import GallerySwitcher, {Galleries} from '@cdo/apps/templates/projects/GallerySwitcher';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import experiments from '@cdo/apps/util/experiments';

const MAX_PROJECTS_PER_CATEGORY = 100;

$(document).ready(() => {
  if (experiments.isEnabled('publicGallery')) {
    // We need to see whether the experiment is enabled from angularProjects.js,
    // which isn't part of the apps js build pipeline.
    $('#angular-my-projects-wrapper').attr('data-isPublicGalleryEnabled', 'true');
    const gallerySwitcher = document.getElementById('gallery-switcher');
    ReactDOM.render(
      <GallerySwitcher
        initialGallery={Galleries.PRIVATE}
        showGallery={showGallery}
      />, gallerySwitcher);

    $.ajax({
      method: 'GET',
      url: `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`,
      dataType: 'json'
    }).done(projectLists => {
      const publicGallery = document.getElementById('public-gallery');
      ReactDOM.render(
        <PublicGallery projectLists={projectLists}/>,
        publicGallery);
    });
  }
});

function showGallery(gallery) {
  $('#angular-my-projects-wrapper').toggle(gallery === Galleries.PRIVATE);
  $('#public-gallery-wrapper').toggle(gallery === Galleries.PUBLIC);
}
