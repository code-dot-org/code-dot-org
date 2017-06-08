import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import i18n from "@cdo/locale";
import { Provider } from 'react-redux';
import { getStore } from '@cdo/apps/redux';
import { setProjectLists } from '@cdo/apps/templates/projects/projectsModule';
import { MAX_PROJECTS_PER_CATEGORY } from '@cdo/apps/templates/projects/projectConstants';

$(document).ready(() => {
  $.ajax({
    method: 'GET',
    url: `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`,
    dataType: 'json'
  }).done(projectLists => {
    getStore().dispatch(setProjectLists(projectLists));
    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(
      <div>
        <HeaderBanner
          headingText={i18n.projectGalleryHeader()}
        />
        <Provider store={getStore()}>
          <PublicGallery />
        </Provider>,
      </div>,
      publicGallery);
  });
});
