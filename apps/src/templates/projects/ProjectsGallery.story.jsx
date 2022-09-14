import React from 'react';
import ProjectsGallery from './ProjectsGallery';
import {Galleries} from './projectConstants';
import projects, {selectGallery} from './projectsRedux';
import currentUser from '../currentUserRedux';
import publishDialog from './publishDialog/publishDialogRedux';
import deleteDialog from './deleteDialog/deleteProjectDialogRedux';
import {Provider} from 'react-redux';
import {reduxStore} from '@cdo/storybook/decorators';

export default {
  title: 'ProjectsGallery',
  component: ProjectsGallery
};

const Template = args => (
  <Provider
    store={reduxStore({projects, currentUser, publishDialog, deleteDialog})}
  >
    <ProjectsGallery
      canShare
      selectGallery={selectGallery}
      limitedGallery
      {...args}
    />
  </Provider>
);

export const MyProjectsSelected = Template.bind({});
MyProjectsSelected.args = {
  selectedGallery: Galleries.PRIVATE
};

export const PublicGallerySelected = Template.bind({});
PublicGallerySelected.args = {
  selectedGallery: Galleries.PUBLIC
};
