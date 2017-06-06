import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PublicGallery, {MAX_PROJECTS_PER_CATEGORY} from '@cdo/apps/templates/projects/PublicGallery';
import HeadingBanner from '@cdo/apps/templates/HeadingBanner';
import i18n from "@cdo/locale";

$(document).ready(() => {
  $.ajax({
    method: 'GET',
    url: `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`,
    dataType: 'json'
  }).done(projectLists => {
    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(
      <div>
        <HeadingBanner
          headingText={i18n.projectGalleryHeader()}
        />
        <PublicGallery initialProjectLists={projectLists}/>
      </div>,
      publicGallery);
  });
});
