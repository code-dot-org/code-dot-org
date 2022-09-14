import React from 'react';
import ProjectsGallery from './ProjectsGallery';
import {Galleries} from './projectConstants';
import projects, {selectGallery} from './projectsRedux';
import currentUser from '../currentUserRedux';
import publishDialog from './publishDialog/publishDialogRedux';
import deleteDialog from './deleteDialog/deleteProjectDialogRedux';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

const createProjectsStore = (reducers = {}, state = {}) => {
  return createStore(
    combineReducers({projects, currentUser, publishDialog, deleteDialog}, state)
  );
};

const Template = args => (
  <Provider store={createProjectsStore()}>
    <ProjectsGallery canShare limitedGallery {...args} />;
  </Provider>
);

export const MyProjectsSelected = Template.bind({});
MyProjectsSelected.args = {
  selectedGallery: Galleries.PRIVATE,
  selectGallery
};

export const PublicGallerySelected = Template.bind({});
PublicGallerySelected.args = {
  selectedGallery: Galleries.PUBLIC,
  selectGallery
};
