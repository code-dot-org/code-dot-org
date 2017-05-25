import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import Dialog from '@cdo/apps/templates/Dialog';
import PublicGallery from '@cdo/apps/templates/projects/PublicGallery';
import experiments from '@cdo/apps/util/experiments';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import i18n from '@cdo/locale';

const MAX_PROJECTS_PER_CATEGORY = 100;

$(document).ready(() => {
  if (experiments.isEnabled('publicGallery')) {
    // We need to see whether the experiment is enabled from angularProjects.js,
    // which isn't part of the apps js build pipeline.
    $('#angular-my-projects-wrapper').attr('data-isPublicGalleryEnabled', 'true');

    const projectsHeader = document.getElementById('projects-header');
    ReactDOM.render(<ProjectHeader />, projectsHeader);

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
  }
});

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
