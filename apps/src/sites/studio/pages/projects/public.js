import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PublicGallery, {MAX_PROJECTS_PER_CATEGORY} from '@cdo/apps/templates/projects/PublicGallery';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';
import i18n from "@cdo/locale";
import { Galleries } from '@cdo/apps/templates/projects/projectConstants';
import { selectGallery } from '@cdo/apps/templates/projects/projectsModule';
import { Provider } from 'react-redux';
import { getStore } from '@cdo/apps/redux';

$(document).ready(() => {
  $.ajax({
    method: 'GET',
    url: `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`,
    dataType: 'json'
  }).done(projectLists => {
    const publicGallery = document.getElementById('public-gallery');
    getStore().dispatch(selectGallery(Galleries.PUBLIC));
    ReactDOM.render(
      <div>
        <HeaderBanner
          headingText={i18n.projectGalleryHeader()}
        />
        <Provider store={getStore()}>
          <PublicGallery initialProjectLists={projectLists}/>
        </Provider>,
      </div>,
      publicGallery);
  });
});
