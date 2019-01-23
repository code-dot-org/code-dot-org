import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import projects, { setProjectLists } from '@cdo/apps/templates/projects/projectsRedux';
import { MAX_PROJECTS_PER_CATEGORY } from '@cdo/apps/templates/projects/projectConstants';
import ProjectHeader from "@cdo/apps/templates/projects/ProjectHeader";

$(document).ready(() => {
  const script = document.querySelector('script[data-projects]');
  const projectsData = JSON.parse(script.dataset.projects);
  const url = `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`;

  registerReducers({projects});
  $.ajax({
    method: 'GET',
    url: url,
    dataType: 'json'
  }).done(projectLists => {
    getStore().dispatch(setProjectLists(projectLists));
    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(
      <Provider store={getStore()}>
        <div>
          <ProjectHeader
            canViewAdvancedTools={projectsData.canViewAdvancedTools}
            projectCount={projectsData.projectCount}
          />
          <PublicGallery
            limitedGallery={projectsData.limitedGallery}
          />
        </div>
      </Provider>,
      publicGallery);
  });
});
