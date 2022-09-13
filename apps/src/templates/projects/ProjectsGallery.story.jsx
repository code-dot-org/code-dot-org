import React from 'react';
import ProjectsGallery from './ProjectsGallery';
import {Galleries} from './projectConstants';
import projects /*, {selectGallery} */ from './projectsRedux';
import currentUser from '../currentUserRedux';
import publishDialog from './publishDialog/publishDialogRedux';
import deleteDialog from './deleteDialog/deleteProjectDialogRedux';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

const createProjectsStore = function() {
  return createStore(
    combineReducers({projects, currentUser, publishDialog, deleteDialog})
  );
};

const Template = args => (
  <Provider store={createProjectsStore()}>
    <ProjectsGallery {...args} canShare={true} />;
  </Provider>
);

export const MyProjectsSelectedInitially = Template.bind({});
MyProjectsSelectedInitially.args = {
  selectedGallery: Galleries.PRIVATE
};

export const PublicGallerySelectedInitially = Template.bind({});
PublicGallerySelectedInitially.args = {
  selectedGallery: Galleries.PUBLIC
};
