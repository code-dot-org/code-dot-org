import React from 'react';
import {UnconnectedProgressLesson as ProgressLesson} from './ProgressLesson';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {combineReducers, createStore} from 'redux';
import {Provider} from 'react-redux';
import {fakeLesson, fakeLevels} from './progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import progress from '@cdo/apps/code-studio/progressRedux';
import teacherSections from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import hiddenLesson from '@cdo/apps/code-studio/hiddenLessonRedux';
import lessonLock from '@cdo/apps/code-studio/lessonLockRedux';

export default {
  title: 'ProgressLesson',
  component: ProgressLesson,
};

const defaultProps = {
  lesson: fakeLesson('Maze', 1),
  levels: [
    {
      ...fakeLevels(1)[0],
      name: 'First progression',
    },
    ...fakeLevels(5, {startLevel: 2}).map(level => ({
      ...level,
      progression: 'Second Progression',
    })),
    {
      ...fakeLevels(1)[0],
      name: 'Last progression',
    },
  ],
  viewAs: ViewType.Instructor,
  isVisible: true,
  isLockedForUser: false,
  isLockedForAllStudents: false,
  lockableAuthorized: true,
  lockableAuthorizedLoaded: true,
  hiddenForStudents: false,
  lockStatusLoaded: true,
};

const initialState = {
  progress: {
    lessonGroups: [],
    lessons: [
      {
        levels: [],
      },
    ],
    focusAreaLessonIds: [],
    isSummaryView: false,
    deeperLearningCourse: false,
    scriptName: 'script-name',
    scriptId: 17,
  },
  teacherSections: {
    sectionsAreLoaded: true,
    sections: {},
    sectionIds: [],
  },
  hiddenLesson: {},
  lessonLock: {},
};

const store = createStore(
  combineReducers({teacherSections, progress, hiddenLesson, lessonLock}),
  initialState
);

const Template = args => (
  <Provider store={store}>
    <ProgressLesson {...defaultProps} {...args} />
  </Provider>
);

export const Default = Template.bind({});

export const WithFocusArea = Template.bind({});
WithFocusArea.args = {
  lesson: {
    ...defaultProps.lesson,
    isFocusArea: true,
  },
};

export const ForPeerReviews = Template.bind({});
ForPeerReviews.args = {
  viewAs: ViewType.Participant,
  currentLessonId: -1,
  lesson: {
    id: -1,
    isFocusArea: false,
    lockable: false,
    name: 'You must complete 4 reviews for this unit',
  },
  levels: [
    {
      id: '-1',
      name: 'Link to submitted review',
      status: LevelStatus.perfect,
      isLocked: false,
      url: '/peer_reviews/1',
      levelNumber: 1,
    },
    {
      id: '-1',
      name: 'Review a new submission',
      status: LevelStatus.not_tried,
      isLocked: false,
      url: '/pull-review',
      levelNumber: 2,
    },
    {
      id: '-1',
      icon: 'fa-lock',
      name: 'Reviews unavailable at this time',
      status: LevelStatus.not_tried,
      isLocked: true,
      url: '',
      levelNumber: 3,
    },
    {
      id: '-1',
      icon: 'fa-lock',
      name: 'Reviews unavailable at this time',
      status: LevelStatus.not_tried,
      isLocked: true,
      url: '',
      levelNumber: 4,
    },
  ],
};

// Should be white with full opacity.
export const HiddenAsInstructor = Template.bind({});
HiddenAsInstructor.args = {
  isVisible: true,
};

// Should not show up.
export const HiddenAsParticipant = Template.bind({});
HiddenAsParticipant.args = {
  hiddenForStudents: true,
  isVisible: true,
};

export const LockedLessonAsVerifiedInstructor = Template.bind({});
LockedLessonAsVerifiedInstructor.args = {
  lesson: fakeLesson('Assessment Number One', 1, true),
  levels: fakeLevels(5, {named: false}),
  isLockedForAllStudents: true,
};

export const UnlockedLessonAsVerifiedInstructor = Template.bind({});
UnlockedLessonAsVerifiedInstructor.args = {
  lesson: fakeLesson('Asessment Number One', 1, true),
  levels: fakeLevels(5, {named: false}),
  isLockedForAllStudents: false,
};

export const LockedLessonAsUnverifiedInstructor = Template.bind({});
LockedLessonAsUnverifiedInstructor.args = {
  lesson: fakeLesson('Asessment Number One', 1, true),
  levels: fakeLevels(5, {named: false}),
  isLockedForUser: true,
  lockableAuthorized: false,
};

export const LockedLessonSignedOut = Template.bind({});
LockedLessonSignedOut.args = {
  viewAs: ViewType.Participant,
  lesson: fakeLesson('Asessment Number One', 1, true),
  levels: fakeLevels(5, {named: false}),
  isLockedForUser: true,
};

export const LockedLessonAsParticipant = Template.bind({});
LockedLessonAsParticipant.args = {
  viewAs: ViewType.Participant,
  lesson: fakeLesson('Asessment Number One', 1, true),
  levels: fakeLevels(5, {named: false}).map(level => ({
    ...level,
    isLocked: true,
  })),
  isLockedForUser: true,
};

export const UnlockedLockableLesson = Template.bind({});
UnlockedLockableLesson.args = {
  lesson: fakeLesson('Asessment Number One', 1, true),
  levels: fakeLevels(5, {named: false}).map(level => ({
    ...level,
    status: LevelStatus.not_tried,
  })),
};
