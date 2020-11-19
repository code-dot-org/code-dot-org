import React from 'react';
import {Provider} from 'react-redux';
import DetailProgressTable from './DetailProgressTable';
import viewAs, {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
  fakeProgressForLevels
} from './progressTestHelpers';
import progress from '@cdo/apps/code-studio/progressRedux';
import hiddenStage from '@cdo/apps/code-studio/hiddenStageRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import stageLock from '@cdo/apps/code-studio/stageLockRedux.js';
import {createStore, combineReducers} from 'redux';
import Immutable from 'immutable';

const lessons = [
  fakeLesson('Jigsaw', 1),
  fakeLesson('Maze', 2),
  fakeLesson('Artist', 3),
  fakeLesson('Something', 4)
];

lessons[0].levels = [
  {
    url: '/step1/level1',
    name: 'First progression',
    levelNumber: 1,
    id: 1
  },
  ...fakeLevels(5, {startLevel: 2}).map(level => ({
    ...level,
    progression: 'Second Progression'
  })),
  {
    url: '/step3/level1',
    name: 'Last progression',
    levelNumber: 7,
    id: 2
  }
];
lessons[1].levels = fakeLevels(2);
lessons[2].levels = fakeLevels(2);
lessons[3].levels = fakeLevels(2);

const startingState = {
  stageLock: {
    stagesBySectionId: {
      11: {}
    }
  },
  viewAs: ViewType.Teacher,
  teacherSections: {
    selectedSectionId: 11
  },
  hiddenStage: Immutable.fromJS({
    stagesBySection: {
      11: {[null]: true}
    }
  }),
  progress: {
    showTeacherInfo: false,
    progressByLevel: fakeProgressForLevels(
      lessons[0].levels
        .concat(lessons[1].levels)
        .concat(lessons[2].levels)
        .concat(lessons[3].levels)
    )
  }
};

const reducers = {progress, teacherSections, viewAs, hiddenStage, stageLock};
const lockedStage = {
  hiddenStage: Immutable.fromJS({
    stagesBySection: {
      11: {[2]: true}
    }
  })
};

export default storybook => {
  storybook.storiesOf('Progress/DetailProgressTable', module).addStoryTable([
    {
      name: 'simple DetailProgressTable',
      story: () => (
        <Provider store={createStore(combineReducers(reducers), startingState)}>
          <DetailProgressTable lessons={lessons} />
        </Provider>
      )
    },
    {
      name: 'with hidden lesson as teacher',
      description: 'lesson 2 should be white with dashed outline',
      story: () => (
        <Provider
          store={createStore(combineReducers(reducers), {
            ...startingState,
            ...lockedStage
          })}
        >
          <DetailProgressTable lessons={lessons} />
        </Provider>
      )
    },
    {
      name: 'with hidden lesson as student',
      description: 'lesson 2 should be invisible',
      story: () => (
        <Provider
          store={createStore(combineReducers(reducers), {
            ...startingState,
            ...lockedStage,
            viewAs: ViewType.Student
          })}
        >
          <DetailProgressTable lessons={lessons} />
        </Provider>
      )
    }
  ]);
};
