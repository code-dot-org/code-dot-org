import React from 'react';
import ProgressDetailToggle from './ProgressDetailToggle';
import {combineReducers, createStore} from 'redux';
import progress, { setIsSummaryView } from '@cdo/apps/code-studio/progressRedux';

export default storybook => {
  function isSummaryTrue() {
    const store = createStore(combineReducers({progress}));
    return {
      name:'isSummary is true',
      story: () => (
        <ProgressDetailToggle store={store}/>
      )
    };
  }

  function isSummaryFalse() {
    const store = createStore(combineReducers({progress}));
    store.dispatch(setIsSummaryView(false));
    return {
      name:'isSummary is false',
      story: () => (
        <ProgressDetailToggle store={store}/>
      )
    };
  }

  storybook
    .storiesOf('ProgressDetailToggle', module)
    .addStoryTable([
      isSummaryTrue(),
      isSummaryFalse()
    ]);
};
