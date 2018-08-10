import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import experiments from '@cdo/apps/util/experiments';
import PublishDialog from '@cdo/apps/templates/projects/publishDialog/PublishDialog';
import DeleteProjectDialog from '@cdo/apps/templates/projects/deleteDialog/DeleteProjectDialog';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import GallerySwitcher from '@cdo/apps/templates/projects/GallerySwitcher';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import PersonalProjectsTable from '@cdo/apps/templates/projects/PersonalProjectsTable';
import { MAX_PROJECTS_PER_CATEGORY, Galleries } from '@cdo/apps/templates/projects/projectConstants';
import projects, {
  selectGallery,
  setProjectLists,
  prependProjects,
  setPersonalProjectsList,
} from '@cdo/apps/templates/projects/projectsRedux';
import publishDialogReducer, {
  showPublishDialog,
} from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import deleteDialogReducer from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';
import { AlwaysPublishableProjectTypes, AllPublishableProjectTypes } from '@cdo/apps/util/sharedConstants';

$(document).ready(() => {
  const script = document.querySelector('script[data-projects]');
  const projectsData = JSON.parse(script.dataset.projects);

  registerReducers({projects, publishDialog: publishDialogReducer, deleteDialog: deleteDialogReducer});
  const store = getStore();
  setupReduxSubscribers(store);
  ReactDOM.render(
    <Provider store={store}>
      <GallerySwitcher/>
    </Provider>,
    document.getElementById('gallery-navigation')
  );

  ReactDOM.render(
    <Provider store={store}>
      <ProjectHeader
        canViewAdvancedTools={projectsData.canViewAdvancedTools}
      />
    </Provider>,
    document.getElementById('projects-header')
  );

  const isPublic = window.location.pathname.startsWith('/projects/public');
  const initialState = isPublic ? Galleries.PUBLIC : Galleries.PRIVATE;
  store.dispatch(selectGallery(initialState));
  const url = `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`;

  $.ajax({
    method: 'GET',
    url: url,
    dataType: 'json'
  }).done(projectLists => {
    store.dispatch(setProjectLists(projectLists));
    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(
      <Provider store={store}>
        <PublicGallery/>
      </Provider>,
      publicGallery);
  });

  if (experiments.isEnabled(experiments.REACT_PROJECTS_TABLE)) {
    const personalProjectsUrl = `/api/v1/projects/personal`;

    $.ajax({
      method: 'GET',
      url: personalProjectsUrl,
      dataType: 'json'
    }).done(personalProjectsList => {
      store.dispatch(setPersonalProjectsList(personalProjectsList));

      ReactDOM.render(
        <Provider store={store}>
          <PersonalProjectsTable/>
        </Provider>,
       document.getElementById('react-my-projects')
      );
    });
  }

  const publishConfirm = document.getElementById('publish-confirm');

  ReactDOM.render(
    <Provider store={store}>
      <PublishDialog/>
    </Provider>,
    publishConfirm
  );

  const deleteConfirm = document.getElementById('delete-confirm');

  ReactDOM.render(
    <Provider store={store}>
      <DeleteProjectDialog/>
    </Provider>,
    deleteConfirm
  );
});

function showGallery(gallery) {
  $('#angular-my-projects-wrapper').toggle(gallery === Galleries.PRIVATE);
  $('#public-gallery-wrapper').toggle(gallery === Galleries.PUBLIC);
}

// Make these available to angularProjects.js. These can go away
// once My Projects is moved to React.

window.onShowConfirmPublishDialog = function (projectId, projectType) {
  getStore().dispatch(showPublishDialog(projectId, projectType));
};

window.AlwaysPublishableProjectTypes = AlwaysPublishableProjectTypes;

window.AllPublishableProjectTypes = AllPublishableProjectTypes;

function setupReduxSubscribers(store) {
  let state = {};
  store.subscribe(() => {
    let lastState = state;
    state = store.getState();

    // Update the project state and immediately add it to the public gallery
    // when a PublishDialog state transition indicates that a project has just
    // been published.
    if (
      lastState.publishDialog &&
      lastState.publishDialog.lastPublishedAt !==
        state.publishDialog.lastPublishedAt
    ) {
      window.setProjectPublishedAt(
        state.publishDialog.projectId,
        state.publishDialog.lastPublishedAt);
      const projectData = state.publishDialog.lastPublishedProjectData;
      const projectType = state.publishDialog.projectType;
      store.dispatch(prependProjects([projectData], projectType));
    }

    if (
      (lastState.projects && lastState.projects.selectedGallery) !==
      (state.projects && state.projects.selectedGallery)
    ) {
      showGallery(state.projects.selectedGallery);
    }

  });
}
