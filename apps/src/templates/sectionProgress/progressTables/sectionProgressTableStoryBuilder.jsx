import React from 'react';
import ProgressTableDetailView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailView';
import ProgressTableSummaryView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryView';
import {Provider} from 'react-redux';
import {createStore, wrapTable} from '../sectionProgressTestHelpers';

/**
 * The variety of stories here can be useful during development, but add
 * unnecessary work to our unit tests and have proven to be potentially flaky
 * due to timeout while processing so much data. Set this value to `true` to
 * enable all the stories.
 */
const INCLUDE_LARGE_STORIES = false;

function buildSmallStories(component) {
  return [
    {
      name: 'Tiny section, small script',
      story: () => {
        const store = createStore(3, 10);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: 'Tiny section, large script',
      story: () => {
        const store = createStore(3, 30);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    }
  ];
}

function buildLargeStories(component) {
  return [
    {
      name: 'Small section, small script',
      story: () => {
        const store = createStore(30, 10);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: 'Small section, large script',
      story: () => {
        const store = createStore(30, 30);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: 'Large section, small script',
      story: () => {
        const store = createStore(200, 10);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: 'Large section, large script',
      story: () => {
        const store = createStore(200, 30);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    }
  ];
}

export let summaryTableStories = buildSmallStories(
  <ProgressTableSummaryView />
);
export let detailTableStories = buildSmallStories(<ProgressTableDetailView />);

if (INCLUDE_LARGE_STORIES) {
  summaryTableStories = summaryTableStories.concat(
    buildLargeStories(<ProgressTableSummaryView />)
  );
  detailTableStories = detailTableStories.concat(
    buildLargeStories(<ProgressTableDetailView />)
  );
}
