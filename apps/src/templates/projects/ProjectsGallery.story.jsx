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

export default storybook => {
  return storybook.storiesOf('Projects/ProjectsGallery', module).addStoryTable([
    {
      name: 'Projects Gallery with My Projects selected initially',
      description: '',
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
    },
    {
      name: 'Projects Gallery with Public Gallery selected initially',
      description: '',
      story: () => {
        const store = createProjectsStore();
        store.dispatch(selectGallery(Galleries.PUBlIC));
        return (
          <Provider store={store}>
            <ProjectsGallery {...DEFAULT_PROPS} />
          </Provider>
        );
      }
    }
  ]);
};
