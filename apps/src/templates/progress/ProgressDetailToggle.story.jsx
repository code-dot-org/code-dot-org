import React from 'react';
import ProgressDetailToggle from './ProgressDetailToggle';
import { Provider } from 'react-redux';
import {combineReducers, createStore} from 'redux';
import progress, { setIsSummaryView } from '@cdo/apps/code-studio/progressRedux';

export default storybook => {
  const storyTable = [];

  // Stick these in anonymous functions so that each instance gets its own
  // store
  (function () {
    const store = createStore(combineReducers({progress}));
    storyTable.push({
      name:'isSummary is true',
      story: () => (
        <Provider store={store}>
          <ProgressDetailToggle/>
        </Provider>
      )
    });
  })();


  (function () {
    const store = createStore(combineReducers({progress}));
    store.dispatch(setIsSummaryView(false));
    storyTable.push({
      name:'isSummary is false',
      story: () => (
        <Provider store={store}>
          <ProgressDetailToggle/>
        </Provider>
      )
    });
  })();

  storybook
    .storiesOf('ProgressDetailToggle', module)
    .addStoryTable(storyTable);
};
