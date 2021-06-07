import React from 'react';
import ProgressDetailToggle from './ProgressDetailToggle';
import {combineReducers, createStore} from 'redux';
import progress, {setIsSummaryView} from '@cdo/apps/code-studio/progressRedux';

export default storybook => {
  const initialState = {
    progress: {
      lessonGroups: [],
      lessons: [
        {
          levels: []
        }
      ],
      focusAreaLessonIds: [],
      professionalLearningCourse: false
    }
  };

  const initialStateGrouped = {
    progress: {
      lessonGroups: [
        {
          display_name: 'cat1',
          id: 1,
          description: 'This is a description',
          big_questions: 'What?'
        },
        {
          display_name: 'cat2',
          id: 2,
          description: 'This is another description',
          big_questions: 'Why?'
        }
      ],
      lessons: [
        {
          lesson_group_display_name: 'cat1',
          levels: []
        },
        {
          lesson_group_display_name: 'cat2',
          levels: []
        }
      ],
      focusAreaLessonIds: [],
      professionalLearningCourse: false
    }
  };

  function isSummaryTrue() {
    const store = createStore(combineReducers({progress}), initialState);
    store.dispatch(setIsSummaryView(true));
    return {
      name: 'isSummary is true',
      story: () => <ProgressDetailToggle store={store} />
    };
  }

  function isSummaryFalse() {
    const store = createStore(combineReducers({progress}), initialState);
    store.dispatch(setIsSummaryView(false));
    return {
      name: 'isSummary is false',
      story: () => <ProgressDetailToggle store={store} />
    };
  }

  function isSummaryTrueGrouped() {
    const store = createStore(combineReducers({progress}), initialStateGrouped);
    store.dispatch(setIsSummaryView(true));
    return {
      name: 'isSummary is true with groups',
      story: () => <ProgressDetailToggle store={store} />
    };
  }

  function isSummaryFalseGrouped() {
    const store = createStore(combineReducers({progress}), initialStateGrouped);
    store.dispatch(setIsSummaryView(false));
    return {
      name: 'isSummary is false with groups',
      story: () => <ProgressDetailToggle store={store} />
    };
  }

  storybook
    .storiesOf('Progress/ProgressDetailToggle', module)
    .withReduxStore()
    .addStoryTable([
      isSummaryTrue(),
      isSummaryFalse(),
      isSummaryTrueGrouped(),
      isSummaryFalseGrouped()
    ]);
};
