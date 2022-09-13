import React from 'react';
import ProjectsGallery from './ProjectsGallery';
import {Galleries} from './projectConstants';
import projects, {selectGallery} from './projectsRedux';
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

const DEFAULT_PROPS = {
  canShare: true
};

export default {
  title: 'ProjectsGallery',
  component: ProjectsGallery
};

const Template = args => <ProjectsGallery description="" {...args} />;

export const MyProjectsSelectedInitially = Template.bind({});
MyProjectsSelectedInitially.args = {
  story: () => {
    const store = createProjectsStore();
    console.log(store.getState());
    store.dispatch(selectGallery(Galleries.PRIVATE));
    return (
      <Provider store={store}>
        <ProjectsGallery {...DEFAULT_PROPS} />
      </Provider>
    );
  }
};

export const PublicGallerySelectedInitially = Template.bind({});
PublicGallerySelectedInitially.args = {
  story: () => {
    const store = createProjectsStore();
    store.dispatch(selectGallery(Galleries.PUBlIC));
    return (
      <Provider store={store}>
        <ProjectsGallery {...DEFAULT_PROPS} />
      </Provider>
    );
  }
};
