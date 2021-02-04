import React from 'react';
import ProgressTableDetailView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailView';
import {Provider} from 'react-redux';
import {createStore, wrapTable} from '../sectionProgressTestHelpers';

export default storybook => {
  storybook.storiesOf('SectionProgress/DetailView', module).addStoryTable([
    {
      name: 'Tiny section, small script',
      story: () => {
        const store = createStore(3, 10);
        return wrapTable(
          <Provider store={store}>
            <ProgressTableDetailView />
          </Provider>
        );
      }
    },
    {
      name: 'Tiny section, large script',
      story: () => {
        const store = createStore(3, 30);
        return wrapTable(
          <Provider store={store}>
            <ProgressTableDetailView />
          </Provider>
        );
      }
    },
    {
      name: 'Small section, small script',
      story: () => {
        const store = createStore(30, 10);
        return wrapTable(
          <Provider store={store}>
            <ProgressTableDetailView />
          </Provider>
        );
      }
    },
    {
      name: 'Small section, large script',
      story: () => {
        const store = createStore(30, 30);
        return wrapTable(
          <Provider store={store}>
            <ProgressTableDetailView />
          </Provider>
        );
      }
    },
    {
      name: 'Large section, small script',
      story: () => {
        const store = createStore(200, 10);
        return wrapTable(
          <Provider store={store}>
            <ProgressTableDetailView />
          </Provider>
        );
      }
    },
    {
      name: 'Large section, large script',
      story: () => {
        const store = createStore(200, 30);
        return wrapTable(
          <Provider store={store}>
            <ProgressTableDetailView />
          </Provider>
        );
      }
    }
  ]);
};
