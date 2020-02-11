import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import PublishDialog from '@cdo/apps/templates/projects/publishDialog/PublishDialog';
import DeleteProjectDialog from '@cdo/apps/templates/projects/deleteDialog/DeleteProjectDialog';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import GallerySwitcher from '@cdo/apps/templates/projects/GallerySwitcher';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import PersonalProjectsTable from '@cdo/apps/templates/projects/PersonalProjectsTable';
import {
  MAX_PROJECTS_PER_CATEGORY,
  Galleries
} from '@cdo/apps/templates/projects/projectConstants';
import projects, {
  selectGallery,
  setProjectLists,
  setPersonalProjectsList
} from '@cdo/apps/templates/projects/projectsRedux';
import publishDialogReducer from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import deleteDialogReducer from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';

$(document).ready(() => {
  // TODO: use helper to get script data
  const script = document.querySelector('script[data-projects]');
  const projectsData = JSON.parse(script.dataset.projects);

  registerReducers({
    projects,
    publishDialog: publishDialogReducer,
    deleteDialog: deleteDialogReducer
  });
  const store = getStore();
  setupReduxSubscribers(store);

  ReactDOM.render(
    <Provider store={store}>
      <div>
        <ProjectHeader
          canViewAdvancedTools={projectsData.canViewAdvancedTools}
          projectCount={projectsData.projectCount}
        />
        <GallerySwitcher />
        {projectsData.isPublic ? (
          <PublicGallery limitedGallery={projectsData.limitedGallery} />
        ) : (
          <PersonalProjectsTable canShare={projectsData.canShare} />
        )}
        <PublishDialog />
        <DeleteProjectDialog />
      </div>
    </Provider>,
    document.querySelector('#projects-page')
  );

  const initialState = projectsData.isPublic
    ? Galleries.PUBLIC
    : Galleries.PRIVATE;
  store.dispatch(selectGallery(initialState));
  const url = `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`;

  $.ajax({
    method: 'GET',
    url: url,
    dataType: 'json'
  }).done(projectLists => {
    store.dispatch(setProjectLists(projectLists));
  });

  $.ajax({
    method: 'GET',
    url: '/api/v1/projects/personal',
    dataType: 'json'
  }).done(personalProjectsList => {
    store.dispatch(setPersonalProjectsList(personalProjectsList));
  });
});

function showGallery(gallery) {
  $('#personal-projects-wrapper').toggle(gallery === Galleries.PRIVATE);
  $('#public-gallery-wrapper').toggle(gallery === Galleries.PUBLIC);
}

function setupReduxSubscribers(store) {
  let state = {};
  store.subscribe(() => {
    let lastState = state;
    state = store.getState();

    if (
      (lastState.projects && lastState.projects.selectedGallery) !==
      (state.projects && state.projects.selectedGallery)
    ) {
      showGallery(state.projects.selectedGallery);
    }
  });
}
