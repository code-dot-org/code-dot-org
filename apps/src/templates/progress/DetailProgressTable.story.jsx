import React from 'react';
import {Provider} from 'react-redux';
import DetailProgressTable from './DetailProgressTable';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
  createStoreWithHiddenLesson,
} from './progressTestHelpers';

export default {
  title: 'DetailProgressTable',
  component: DetailProgressTable,
};

const lessons = [
  fakeLesson('Jigsaw', 1),
  fakeLesson('Maze', 2),
  fakeLesson('Artist', 3),
  fakeLesson('Something', 4),
];

const levelsByLesson = [
  [
    {
      id: '30',
      status: LevelStatus.not_tried,
      isLocked: false,
      url: '/step1/level1',
      name: 'First progression',
      levelNumber: 1,
    },
    ...fakeLevels(5, {startLevel: 2}).map(level => ({
      ...level,
      progression: 'Second Progression',
    })),
    {
      id: '40',
      status: LevelStatus.not_tried,
      isLocked: false,
      url: '/step3/level1',
      name: 'Last progression',
      levelNumber: 7,
    },
  ],
  fakeLevels(2),
  fakeLevels(2),
  fakeLevels(2),
];

const groupedLesson = {lessons, levelsByLesson};

const Template = store => (
  <Provider store={store}>
    <DetailProgressTable groupedLesson={groupedLesson} />
  </Provider>
);

export const Simple = Template.bind({});
Simple.args = createStoreWithHiddenLesson(ViewType.Instructor, null);

// Lesson 2 should be white with dashed outline.
export const WithHiddenLessonAsInstructor = Template.bind({});
WithHiddenLessonAsInstructor.args = createStoreWithHiddenLesson(
  ViewType.Instructor,
  '2'
);

// Lesson 2 should be invisible.
export const WithHiddenLessonAsParticipant = Template.bind({});
WithHiddenLessonAsParticipant.args = createStoreWithHiddenLesson(
  ViewType.Participant,
  '2'
);
