import React from 'react';
import GallerySwitcher from './GallerySwitcher';
import {Galleries} from './projectConstants';
import {selectedGallery, selectGallery} from './projectsModule';
import {createStore, combineReducers} from 'redux';
import {Provider} from 'react-redux';

const createProjectsStore = function () {
  return createStore(combineReducers({
    selectedGallery: selectedGallery
  }));
};

export default storybook => {
  return storybook
    .storiesOf('GallerySwitcher', module)
    .addStoryTable([
      {
        name: 'Gallery Switcher with My Projects selected initially',
        description: '',
        story: () => {
          const store = createProjectsStore();
          store.dispatch(selectGallery(Galleries.PRIVATE));
          return (
            <Provider store={store}>
              <GallerySwitcher
                showGallery={storybook.action('showGallery')}
              />
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
              <GallerySwitcher
                showGallery={storybook.action('showGallery')}
              />
            </Provider>
          );
        }
      },
    ]);
};
