import React from 'react';
import GallerySwitcher from './GallerySwitcher';
import {Galleries} from './projectConstants';
import projects, {selectGallery} from './projectsRedux';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

const createProjectsStore = function() {
  return createStore(combineReducers({projects}));
};

const DEFAULT_PROPS = {
  canShare: true
};

export default storybook => {
  return storybook.storiesOf('Projects/GallerySwitcher', module).addStoryTable([
    {
      name: 'Gallery Switcher with My Projects selected initially',
      description: '',
      story: () => {
        const store = createProjectsStore();
        store.dispatch(selectGallery(Galleries.PRIVATE));
        return (
          <Provider store={store}>
            <GallerySwitcher {...DEFAULT_PROPS} />
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
            <GallerySwitcher {...DEFAULT_PROPS} />
          </Provider>
        );
      }
    }
  ]);
};
