import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';
import {Provider} from 'react-redux';

import {getStore, registerReducers} from '@cdo/apps/redux';
import deleteDialogReducer from '@cdo/apps/templates/projects/deleteDialog/deleteProjectDialogRedux';
import {Galleries} from '@cdo/apps/templates/projects/projectConstants';
import ProjectHeader from '@cdo/apps/templates/projects/ProjectHeader';
import ProjectsGallery from '@cdo/apps/templates/projects/ProjectsGallery';
import projects, {
  selectGallery,
  setPersonalProjects,
  setPublicProjects,
  setCaptchaKey,
} from '@cdo/apps/templates/projects/projectsRedux';
import publishDialogReducer from '@cdo/apps/templates/projects/publishDialog/publishDialogRedux';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const projectsData = getScriptData('projects');
  registerReducers({
    projects,
    publishDialog: publishDialogReducer,
    deleteDialog: deleteDialogReducer,
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
  store.dispatch(setCaptchaKey(projectsData.recaptchaSiteKey));

  const root = createRoot(document.querySelector('#projects-page'));

  root.render(
    <Provider store={store}>
      <div>
        <ProjectHeader
          canViewAdvancedTools={projectsData.canViewAdvancedTools}
          projectCount={projectsData.projectCount}
        />
        <div className={'main container'}>
          <ProjectsGallery limitedGallery={projectsData.limitedGallery} />
        </div>
      </div>
    </Provider>
  );
});
