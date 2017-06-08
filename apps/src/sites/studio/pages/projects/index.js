import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore } from '@cdo/apps/redux';
import Dialog from '@cdo/apps/templates/Dialog';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import i18n from '@cdo/locale';
import { MAX_PROJECTS_PER_CATEGORY, Galleries } from '@cdo/apps/templates/projects/projectConstants';
import { selectGallery, setProjectLists } from '@cdo/apps/templates/projects/projectsModule';

$(document).ready(() => {
  // We need to see whether the experiment is enabled from angularProjects.js,
  // which isn't part of the apps js build pipeline.
  $('#angular-my-projects-wrapper').attr('data-isPublicGalleryEnabled', 'true');

  const projectsHeader = document.getElementById('projects-header');
  ReactDOM.render(
    <Provider store={getStore()}>
      <ProjectHeader showGallery={showGallery} />
    </Provider>,
    projectsHeader
  );

  const isPublic = window.location.pathname.startsWith('/projects/public');
  const initialState = isPublic ? Galleries.PUBLIC : Galleries.PRIVATE;
  getStore().dispatch(selectGallery(initialState));

  $.ajax({
    method: 'GET',
    url: `/api/v1/projects/gallery/public/all/${MAX_PROJECTS_PER_CATEGORY}`,
    dataType: 'json'
  }).done(projectLists => {
    getStore().dispatch(setProjectLists(projectLists));
    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(
      <Provider store={getStore()}>
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

function onConfirmPublish(callback) {
  hideDialog();
  callback();
}

function hideDialog() {
  const publishConfirm = document.getElementById('publish-confirm');
  ReactDOM.render(<Dialog isOpen={false}/>, publishConfirm);
}
