import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {getStore, registerReducers} from '@cdo/apps/redux';
import getScriptData from '@cdo/apps/util/getScriptData';
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
  const specialAnnouncement = projectsData.specialAnnouncement;
  registerReducers({
    projects,
    publishDialog: publishDialogReducer,
    deleteDialog: deleteDialogReducer
  });
  const store = getStore();

  // Default to private gallery if no tab is specified.
  const currentTab = (
    projectsData.currentTab || Galleries.PRIVATE
  ).toUpperCase();

  if (!Object.values(Galleries).includes(currentTab)) {
    console.error(
      `Unknown /projects tab '${currentTab}'. Make sure to add this tab to the Galleries constant.`
    );
  }

  store.dispatch(selectGallery(currentTab));
  store.dispatch(setPersonalProjects());
  store.dispatch(setPublicProjects());

  ReactDOM.render(
    <Provider store={store}>
      <div>
        <ProjectHeader
          canViewAdvancedTools={projectsData.canViewAdvancedTools}
          projectCount={projectsData.projectCount}
          specialAnnouncement={specialAnnouncement}
        />
        <div className={'main container'}>
          <ProjectsGallery
            limitedGallery={projectsData.limitedGallery}
            canShare={projectsData.canShare}
          />
        </div>
      </div>
    </Provider>,
    document.querySelector('#projects-page')
  );
});
