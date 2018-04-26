import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import PublishDialog from '@cdo/apps/templates/publishDialog/PublishDialog';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import { MAX_PROJECTS_PER_CATEGORY, Galleries } from '@cdo/apps/templates/projects/projectConstants';
import projects, {
  selectGallery,
  setProjectLists,
  prependProjects,
} from '@cdo/apps/templates/projects/projectsRedux';
import publishDialogReducer, {
  showPublishDialog,
} from '@cdo/apps/templates/publishDialog/publishDialogRedux';
import { PublishableProjectTypes } from '@cdo/apps/util/sharedConstants';
import StartNewProject from '@cdo/apps/templates/projects/StartNewProject';

$(document).ready(() => {
  const script = document.querySelector('script[data-projects]');
  const projectsData = JSON.parse(script.dataset.projects);

  registerReducers({projects, publishDialog: publishDialogReducer});
  const store = getStore();
  setupReduxSubscribers(store);
  const projectsHeader = document.getElementById('projects-header');
  ReactDOM.render(
    <Provider store={store}>
      <ProjectHeader/>
    </Provider>,
    projectsHeader
  );

  ReactDOM.render(
    <Provider store={store}>
      <StartNewProject
        canViewFullList
        canViewAdvancedTools={projectsData.canViewAdvancedTools}
      />
    </Provider>,
    document.getElementById('new-project-buttons')
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
        <PublicGallery
          projectValidator={projectsData.projectValidator}
        />
      </Provider>,
      publicGallery);
  });

  const publishConfirm = document.getElementById('publish-confirm');

  ReactDOM.render(
    <Provider store={store}>
      <PublishDialog/>
    </Provider>,
    publishConfirm
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

window.PublishableProjectTypes = PublishableProjectTypes;

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
