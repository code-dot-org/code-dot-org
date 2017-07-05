import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { getStore } from '@cdo/apps/redux';
import Dialog from '@cdo/apps/templates/Dialog';
import PublicGallery, {MAX_PROJECTS_PER_CATEGORY} from '@cdo/apps/templates/projects/PublicGallery';
import ProjectWidget from '@cdo/apps/templates/projects/ProjectWidget';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import i18n from '@cdo/locale';
import { Galleries } from '@cdo/apps/templates/projects/projectConstants';
import { selectGallery } from '@cdo/apps/templates/projects/projectsModule';

$(document).ready(() => {
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
    const publicGallery = document.getElementById('public-gallery');
    ReactDOM.render(
      <Provider store={getStore()}>
        <PublicGallery initialProjectLists={projectLists}/>
      </Provider>,
      publicGallery);
  });

  $.ajax({
    method: 'GET',
    url: `/v3/channels`,
    dataType: 'json'
  }).done(projectLists => {
    const widget = document.getElementById('projects-widget');
    projectLists.sort((a, b) => {
      if (a.updatedAt < b.updatedAt) {
        return 1;
      } else {
        return -1;
      }
    });
    projectLists = projectLists.filter(project => {
      return !project.hidden;
    });
    projectLists = projectLists.slice(0,4);
    let convertedProjectList = [];
    for (let i = 0; i < projectLists.length; i++){
      let convertedProject = {
        name: projectLists[i].name,
        channel: projectLists[i].id,
        thumbnailUrl: projectLists[i].thumbnailUrl,
        type: projectLists[i].projectType,
        updatedAt: projectLists[i].updatedAt
      };
      convertedProjectList.push(convertedProject);
    }
    ReactDOM.render(
      <Provider store={getStore()}>
        <ProjectWidget projectList={convertedProjectList}/>
      </Provider>,
      widget);
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
