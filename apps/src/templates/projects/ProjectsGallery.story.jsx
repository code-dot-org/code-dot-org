import React from 'react';
import ProjectsGallery from './ProjectsGallery';
import {Galleries} from './projectConstants';
import projects, {selectGallery} from './projectsRedux';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {action} from '@storybook/addon-actions';

const createProjectsStore = function() {
  return createStore(combineReducers({projects}));
};

export default storybook => {
  return storybook.storiesOf('Projects/ProjectsGallery', module).addStoryTable([
    {
      name: 'Gallery Switcher with My Projects selected initially',
      description: '',
      story: () => {
        const store = createProjectsStore();
        store.dispatch(selectGallery(Galleries.PRIVATE));
        return (
          <Provider store={store}>
            <ProjectsGallery showGallery={action('showGallery')} />
          </Provider>
        );
      }
    },
    {
      name: 'Gallery Switcher with Public Gallery selected initially',
      description: '',
      story: () => {
        const store = createProjectsStore();
        store.dispatch(selectGallery(Galleries.PUBlIC));
        return (
          <Provider store={store}>
            <ProjectsGallery showGallery={action('showGallery')} />
          </Provider>
        );
      }
    }
  ]);
};
