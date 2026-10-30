import React from 'react';
import {Provider} from 'react-redux';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import LessonGroup from './LessonGroup';
import {
  fakeLesson,
  fakeLevels,
  createStoreWithHiddenLesson,
} from './progressTestHelpers';

const lessons = [
  fakeLesson('Jigsaw', 1),
  fakeLesson('Maze', 2),
  fakeLesson('Artist', 3),
  fakeLesson('Something', 4),
];

const levelsByLesson = [
  [
    {
      id: '20',
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
      id: '21',
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

const groupedLesson = {
  lessonGroup: {displayName: 'My Group'},
  lessons,
  levelsByLesson,
};

export default {
  component: LessonGroup,
};

export const WithDetailView = () => (
  <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, null)}>
    <LessonGroup
      groupedLesson={groupedLesson}
      isPlc={false}
      isSummaryView={false}
    />
  </Provider>
);
export const InstructorSummaryWithOneHiddenLesson = () => (
  <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, 3)}>
    <LessonGroup
      groupedLesson={groupedLesson}
      isPlc={false}
      isSummaryView={true}
    />
  </Provider>
);

export const InstructorSummaryWithAllLessonsHidden = () => (
  <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, 1)}>
    <LessonGroup
      groupedLesson={{
        lessonGroup: {
          displayName: 'My Group',
          description: 'Lesson Group Description',
          bigQuestions: 'Why? Who? Where?',
        },
        lessons: [lessons[0]],
        levelsByLesson: [levelsByLesson[0]],
      }}
      isPlc={false}
      isSummaryView={true}
    />
  </Provider>
);

export const InstructorViewWithNoLessons = () => (
  <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, 1)}>
    <LessonGroup
      groupedLesson={{
        lessonGroup: {
          displayName: 'My Group',
          description: 'Lesson Group Description',
          bigQuestions: 'Why? Who? Where?',
        },
        lessons: [],
        levelsByLesson: [],
      }}
      isPlc={false}
      isSummaryView={true}
    />
  </Provider>
);

export const ParticipantViewWithAllLessonsHidden = () => (
  <Provider store={createStoreWithHiddenLesson(ViewType.Participant, 1)}>
    <LessonGroup
      groupedLesson={{
        lessonGroup: {
          displayName: 'My Group',
          description: 'Lesson Group Description',
          bigQuestions: 'Why? Who? Where?',
        },
        lessons: [lessons[0]],
        levelsByLesson: [levelsByLesson[0]],
      }}
      isPlc={false}
      isSummaryView={true}
    />
  </Provider>
);

export const Plc = () => (
  <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, null)}>
    <LessonGroup
      groupedLesson={groupedLesson}
      isPlc={true}
      isSummaryView={false}
    />
  </Provider>
);

export const WithDescriptionAndBigQuestions = () => (
  <Provider store={createStoreWithHiddenLesson(ViewType.Instructor, null)}>
    <LessonGroup
      groupedLesson={{
        ...groupedLesson,
        lessonGroup: {
          displayName: 'My Group',
          description: 'Lesson Group Description',
          bigQuestions: 'Why? Who? Where?',
        },
      }}
      isPlc={false}
      isSummaryView={false}
    />
  </Provider>
);
