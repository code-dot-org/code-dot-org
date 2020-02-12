import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
import PublishDialog from '@cdo/apps/templates/projects/publishDialog/PublishDialog';
import DeleteProjectDialog from '@cdo/apps/templates/projects/deleteDialog/DeleteProjectDialog';
import ProjectsGallery from '@cdo/apps/templates/projects/ProjectsGallery';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import {Galleries} from '@cdo/apps/templates/projects/projectConstants';
import projects, {
  selectGallery,
  setPersonalProjects,
  setPublicProjects
} from '@cdo/apps/templates/projects/projectsRedux';
import publishDialogReducer from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import deleteDialogReducer from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';

$(document).ready(() => {
  const projectsData = getScriptData('projects');
  registerReducers({
    projects,
    publishDialog: publishDialogReducer,
    deleteDialog: deleteDialogReducer
  });
  const store = getStore();

  const initialState = projectsData.isPublic
    ? Galleries.PUBLIC
    : Galleries.PRIVATE;
  store.dispatch(selectGallery(initialState));
  store.dispatch(setPersonalProjects());
  store.dispatch(setPublicProjects());

  ReactDOM.render(
    <Provider store={store}>
      <div>
        <ProjectHeader
          canViewAdvancedTools={projectsData.canViewAdvancedTools}
          projectCount={projectsData.projectCount}
        />
        <ProjectsGallery
          limitedGallery={projectsData.limitedGallery}
          canShare={projectsData.canShare}
        />
        {/* TODO: Move components below into <PersonalProjectsTable/>? */}
        <PublishDialog />
        <DeleteProjectDialog />
      </div>
    </Provider>,
    document.querySelector('#projects-page')
  );
});
