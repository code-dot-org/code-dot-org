import React from 'react';
import ProgressTableSummaryView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryView';
import {Provider} from 'react-redux';
import {createStore, wrapTable} from '../sectionProgressTestHelpers';

export default storybook => {
  storybook.storiesOf('SectionProgress/SummaryView', module).addStoryTable([
    {
      name: 'Tiny section, small script',
      story: () => {
        const store = createStore(3, 10);
        return wrapTable(
          <Provider store={store}>
            <ProgressTableSummaryView />
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
            <ProgressTableSummaryView />
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
            <ProgressTableSummaryView />
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
            <ProgressTableSummaryView />
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
            <ProgressTableSummaryView />
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
            <ProgressTableSummaryView />
          </Provider>
        );
      }
    }
  ]);
};
