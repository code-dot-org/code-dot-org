import React from 'react';
import ProgressTableView from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableView';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';
import {Provider} from 'react-redux';
import {createStore, wrapTable} from '../sectionProgressTestHelpers';

/**
 * The variety of stories here can be useful during development, but add
 * unnecessary work to our unit tests and have proven to be potentially flaky
 * due to timeout while processing so much data. Set this value to `true` to
 * enable all the stories.
 */
const INCLUDE_LARGE_STORIES = false;

function buildSmallStories(component, currentView) {
  return [
    {
      name: `${currentView} - Tiny section, small script`,
      story: () => {
        const store = createStore(3, 10);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: `${currentView} - Tiny section, large script`,
      story: () => {
        const store = createStore(3, 30);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    }
  ];
}

function buildLargeStories(component, currentView) {
  return [
    {
      name: `${currentView} - Small section, small script`,
      story: () => {
        const store = createStore(30, 10);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: `${currentView} - Small section, large script`,
      story: () => {
        const store = createStore(30, 30);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: `${currentView} - Large section, small script`,
      story: () => {
        const store = createStore(200, 10);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    },
    {
      name: `${currentView} - Large section, large script`,
      story: () => {
        const store = createStore(200, 30);
        return wrapTable(<Provider store={store}>{component}</Provider>);
      }
    }
  ];
}

let summaryViewStories = buildSmallStories(
  <ProgressTableView currentView={ViewType.SUMMARY} />,
  ViewType.SUMMARY
);
let detailViewStories = buildSmallStories(
  <ProgressTableView currentView={ViewType.DETAIL} />,
  ViewType.DETAIL
);

if (INCLUDE_LARGE_STORIES) {
  summaryViewStories = summaryViewStories.concat(
    buildLargeStories(
      <ProgressTableView currentView={ViewType.SUMMARY} />,
      ViewType.SUMMARY
    )
  );
  detailViewStories = detailViewStories.concat(
    buildLargeStories(
      <ProgressTableView currentView={ViewType.DETAIL} />,
      ViewType.DETAIL
    )
  );
}

const progressTableViewStories = summaryViewStories.concat(detailViewStories);

export default storybook => {
  storybook
    .storiesOf('SectionProgress/ProgressTableView', module)
    .addStoryTable(progressTableViewStories);
};
