import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore, registerReducers } from '@cdo/apps/redux';
import Dialog from '@cdo/apps/templates/Dialog';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import i18n from '@cdo/locale';
import { MAX_PROJECTS_PER_CATEGORY, Galleries } from '@cdo/apps/templates/projects/projectConstants';
import projects, { selectGallery, setProjectLists, prependProjects } from '@cdo/apps/templates/projects/projectsRedux';

$(document).ready(() => {
  registerReducers({projects});
  const store = getStore();
  const projectsHeader = document.getElementById('projects-header');
  ReactDOM.render(
    <Provider store={store}>
      <ProjectHeader showGallery={showGallery} />
    </Provider>,
    projectsHeader
  );

  const isPublic = window.location.pathname.startsWith('/projects/public');
  const initialState = isPublic ? Galleries.PUBLIC : Galleries.PRIVATE;
  store.dispatch(selectGallery(initialState));

  $.ajax({
    method: 'GET',
    url: `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`,
    dataType: 'json'
  }).done(projectLists => {
    store.dispatch(setProjectLists(projectLists));
    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(
      <Provider store={store}>
        <PublicGallery />
      </Provider>,
      publicGallery);
  });
});

function showGallery(gallery) {
  $('#angular-my-projects-wrapper').toggle(gallery === Galleries.PRIVATE);
  $('#public-gallery-wrapper').toggle(gallery === Galleries.PUBLIC);
}

function onShowConfirmPublishDialog(callback) {
  const publishConfirm = document.getElementById('publish-confirm');
  ReactDOM.render(
    <Dialog
      title={i18n.publishToPublicGallery()}
      body={i18n.publishToPublicGalleryWarning()}
      confirmText={i18n.publish()}
      isOpen={true}
      handleClose={hideDialog}
      onCancel={hideDialog}
      onConfirm={onConfirmPublish.bind(this, callback)}
    />,
    publishConfirm
  );
}

// Make this method available to angularProjects.js. This can go away
// once My Projects is moved to React.
window.onShowConfirmPublishDialog = onShowConfirmPublishDialog;

/**
 * Shows a project at the front of the specified list of published projects.
 * @param {Object} projectData The data for a published project, in the format
 *   defined by projectConstants.projectDataPropType.
 * @param {string} projectType Which list of projects to add this project to.
 *   Valid values include applab, gamelab, playlab, or artist.
 */
function showNewPublishedProject(projectData, projectType) {
  getStore().dispatch(prependProjects([projectData], projectType));
}

// Make this method available to angularProjects.js. This can go away
// once My Projects is moved to React.
window.showNewPublishedProject = showNewPublishedProject.bind(this);

function onConfirmPublish(callback) {
  hideDialog();
  callback();
}

function hideDialog() {
  const publishConfirm = document.getElementById('publish-confirm');
  ReactDOM.render(<Dialog isOpen={false}/>, publishConfirm);
}
