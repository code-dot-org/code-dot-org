import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';

const MAX_PROJECTS_PER_CATEGORY = 100;

$(document).ready(() => {
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
});
