import React from 'react';
import ProgressDetailToggle from './ProgressDetailToggle';
import {combineReducers, createStore} from 'redux';
import progress, { setIsSummaryView } from '@cdo/apps/code-studio/progressRedux';

export default storybook => {
  const initialState = {
    progress: {
      stages: [
        {
          levels: []
        }
      ],
      focusAreaStageIds: [],
      professionalLearningCourse: false
    }
  };

  const initialStateGrouped = {
    progress: {
      stages: [
        {
          flex_category: 'cat1',
          levels: []
        },
        {
          flex_category: 'cat2',
          levels: []
        }
      ],
      focusAreaStageIds: [],
      professionalLearningCourse: false
    }
  };

  function isSummaryTrue() {
    const store = createStore(combineReducers({progress}), initialState);
    store.dispatch(setIsSummaryView(true));
    return {
      name:'isSummary is true',
      story: () => (
        <ProgressDetailToggle
          store={store}
        />
      )
    };
  }

  function isSummaryFalse() {
    const store = createStore(combineReducers({progress}), initialState);
    store.dispatch(setIsSummaryView(false));
    return {
      name:'isSummary is false',
      story: () => (
        <ProgressDetailToggle
          store={store}
        />
      )
    };
  }

  function isSummaryTrueGrouped() {
    const store = createStore(combineReducers({progress}), initialStateGrouped);
    store.dispatch(setIsSummaryView(true));
    return {
      name:'isSummary is true with groups',
      story: () => (
        <ProgressDetailToggle
          store={store}
        />
      )
    };
  }

  function isSummaryFalseGrouped() {
    const store = createStore(combineReducers({progress}), initialStateGrouped);
    store.dispatch(setIsSummaryView(false));
    return {
      name:'isSummary is false with groups',
      story: () => (
        <ProgressDetailToggle
          store={store}
        />
      )
    };
  }

  storybook
    .storiesOf('Progress/ProgressDetailToggle', module)
    .addStoryTable([
      isSummaryTrue(),
      isSummaryFalse(),
      isSummaryTrueGrouped(),
      isSummaryFalseGrouped(),
    ]);
};
