import React from 'react';
import {Provider} from 'react-redux';
import {createStore, combineReducers} from 'redux';

import {TestResults} from '@cdo/apps/constants';

import lessonLock from '../../lessonLockRedux';
import progress, {
  initProgress,
  mergeResults,
  setLessonExtrasEnabled,
} from '../../progressRedux';

import LessonProgress from './LessonProgress';

const activityPuzzle = {
  ids: ['123'],
  activeId: '123',
  position: 1,
  kind: 'puzzle',
  icon: '',
  title: 1,
  url: 'http://studio.code.org/s/course1/lessons/3/levels/2',
  freePlay: false,
  is_concept_level: false,
};

const conceptPuzzle = {
  ids: ['5086'],
  activeId: '5086',
  position: 2,
  kind: 'puzzle',
  icon: 'fa-file-text',
  title: 2,
  url: 'http://studio.code.org/s/csp1-2019/lessons/2/levels/1',
  freePlay: false,
  progression: 'Lesson Vocabulary & Resources',
  is_concept_level: true,
};

const assessment1 = {
  ids: ['2441'],
  activeId: '2441',
  position: 3,
  kind: 'assessment',
  icon: 'fa-check-square-o',
  title: 3,
  url: 'http://studio.code.org/s/csp1-2019/lessons/2/levels/3',
  freePlay: false,
  progression: 'Check Your Understanding',
};

const assessment2 = {
  ids: ['2444'],
  activeId: '2444',
  position: 4,
  kind: 'assessment',
  icon: 'fa-check-square-o',
  title: 4,
  url: 'http://studio.code.org/s/csp1-2019/lessons/2/levels/4',
  freePlay: false,
  progression: 'Check Your Understanding',
};

const assessment3 = {
  ids: ['2744'],
  activeId: '2744',
  position: 5,
  kind: 'assessment',
  icon: 'fa-check-square-o',
  title: 5,
  url: 'http://studio.code.org/s/csp1-2019/lessons/2/levels/5',
  freePlay: false,
  progression: 'Check Your Understanding',
};

const unplugged = {
  ids: ['2093'],
  activeId: '2093',
  is_concept_level: false,
  kind: 'unplugged',
  isUnplugged: true,
  position: 1,
  title: 1,
  url: 'http://studio.code.org/s/course1/lessons/1/levels/1',
};

const bonus = {
  ids: ['100'],
  activeId: '100',
  title: 1,
  bonus: true,
};

export default {
  component: LessonProgress,
};

const createStoreForLevels = (
  levels,
  currentLevelIndex,
  showLessonExtras,
  onLessonExtras,
  bonusCompleted
) => {
  const store = createStore(combineReducers({progress, lessonLock}));
  store.dispatch(
    initProgress({
      currentLevelId: currentLevelIndex
        ? levels[currentLevelIndex].ids[0].toString()
        : null,
      isLessonExtras: onLessonExtras,
      scriptName: 'csp1',
      saveAnswersBeforeNavigation: false,
      lessons: [
        {
          id: 123,
          lesson_extras_level_url: showLessonExtras && 'fakeurl',
          levels,
        },
      ],
    })
  );
  const results = {123: TestResults.ALL_PASS};
  if (bonusCompleted) {
    results[100] = TestResults.ALL_PASS;
  }
  store.dispatch(mergeResults(results));
  store.dispatch(setLessonExtrasEnabled(showLessonExtras));
  return store;
};

// Template
const Template = args => {
  return (
    <Provider store={args.store}>
      <LessonProgress />
    </Provider>
  );
};

// Stories
export const LessonProgressExample = Template.bind({});
LessonProgressExample.args = {
  store: createStoreForLevels(
    [activityPuzzle, conceptPuzzle, assessment1, assessment2, assessment3],
    4
  ),
};

export const UnpluggedAsCurrent = Template.bind({});
UnpluggedAsCurrent.args = {
  store: createStoreForLevels([unplugged, assessment1], 0),
};

export const UnpluggedAsNonCurrent = Template.bind({});
UnpluggedAsNonCurrent.args = {
  store: createStoreForLevels([unplugged, assessment1], 1),
};

export const LessonExtrasNotStarted = Template.bind({});
LessonExtrasNotStarted.args = {
  store: createStoreForLevels(
    [activityPuzzle, conceptPuzzle],
    1,
    true /* showLessonExtras */,
    false /* onLessonExtras */
  ),
};

export const LessonExtrasCompleted = Template.bind({});
LessonExtrasCompleted.args = {
  store: createStoreForLevels(
    [activityPuzzle, conceptPuzzle, bonus],
    1,
    true /* showLessonExtras */,
    false /* onLessonExtras */,
    true /* bonusCompleted */
  ),
};

export const LessonExtrasCurrentLevelNotStarted = Template.bind({});
LessonExtrasCurrentLevelNotStarted.args = {
  store: createStoreForLevels(
    [activityPuzzle, conceptPuzzle],
    null,
    true /* showLessonExtras */,
    true /* onLessonExtras */
  ),
};

export const LessonExtrasCurrentLevelCompleted = Template.bind({});
LessonExtrasCurrentLevelCompleted.args = {
  store: createStoreForLevels(
    [activityPuzzle, conceptPuzzle, bonus],
    null,
    true /* showLessonExtras */,
    true /* onLessonExtras */,
    true /* bonusCompleted */
  ),
};

export const LessonEmptyTrophy = Template.bind({});
LessonEmptyTrophy.args = {
  store: createStoreForLevels(
    [assessment1, assessment1],
    0,
    false /* showLessonExtras */,
    true /* onLessonExtras */
  ),
};

export const Lesson20PercentTrophy = Template.bind({});
Lesson20PercentTrophy.args = {
  store: createStoreForLevels(
    [activityPuzzle, assessment1, assessment1, assessment1, assessment1],
    0,
    false /* showLessonExtras */,
    true /* onLessonExtras */
  ),
};

export const Lesson67PercentTrophy = Template.bind({});
Lesson67PercentTrophy.args = {
  store: createStoreForLevels(
    [activityPuzzle, activityPuzzle, assessment1],
    0,
    false /* showLessonExtras */,
    true /* onLessonExtras */
  ),
};

export const LessonMasteryTrophy = Template.bind({});
LessonMasteryTrophy.args = {
  store: createStoreForLevels(
    [activityPuzzle, activityPuzzle, activityPuzzle],
    0,
    false /* showLessonExtras */,
    true /* onLessonExtras */
  ),
};
