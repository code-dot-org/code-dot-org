import React from 'react';
import {UnconnectedSummaryProgressTable as SummaryProgressTable} from './SummaryProgressTable';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {
  fakeLesson,
  fakeLevels,
  fakeLevel,
  createStoreWithHiddenLesson,
  createStoreWithLockedLesson,
} from './progressTestHelpers';
import {Provider} from 'react-redux';

export default {
  title: 'SummaryProgressTable',
  component: SummaryProgressTable,
};

const defaultProps = {
  groupedLesson: {
    lessons: [
      fakeLesson('Jigsaw', 1, false, 1),
      fakeLesson('Maze', 2, false, 2),
      fakeLesson('Artist', 3, false, 3),
      fakeLesson('Something', 4, false, 4),
    ],
    levelsByLesson: [
      [
        {
          ...fakeLevels(1)[0],
          name: 'First progression',
        },
        ...fakeLevels(5, 2).map(level => ({
          ...level,
          progression: 'Second Progression',
        })),
        {
          ...fakeLevels(1)[0],
          name: 'Last progression',
        },
      ],
      fakeLevels(2),
      fakeLevels(2),
      fakeLevels(2),
    ],
  },
  viewAs: ViewType.Participant,
  lessonIsVisible: () => true,
};

const Template = args => {
  const {store, props} = args;

  return (
    <Provider store={store}>
      <SummaryProgressTable {...props} />
    </Provider>
  );
};

export const Simple = Template.bind({});
Simple.args = {
  store: createStoreWithHiddenLesson(ViewType.Instructor, null),
  props: defaultProps,
};

export const WithFocusArea = Template.bind({});
WithFocusArea.args = {
  store: createStoreWithHiddenLesson(ViewType.Instructor, null),
  props: {
    ...defaultProps,
    groupedLesson: {
      lessons: defaultProps.groupedLesson.lessons.map((lesson, index) => ({
        ...lesson,
        isFocusArea: index === 1,
      })),
      levelsByLesson: defaultProps.groupedLesson.levelsByLesson.map(
        (levels, index) => (index === 1 ? fakeLevels(8) : levels)
      ),
    },
    lessonIsVisible: () => true,
  },
};

export const ForPeerReviews = Template.bind({});
ForPeerReviews.args = {
  store: createStoreWithHiddenLesson(ViewType.Instructor, null),
  props: {
    groupedLesson: {
      lessons: [
        {
          id: -1,
          isFocusArea: false,
          lockable: false,
          name: 'You must complete 3 reviews for this unit',
        },
      ],
      levelsByLesson: [
        [
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
        ],
      ],
    },
    lessonIsVisible: () => true,
  },
};

export const SecondLessonHiddenAsInstructor = Template.bind({});
SecondLessonHiddenAsInstructor.args = {
  store: createStoreWithHiddenLesson(ViewType.Instructor, '2'),
  props: {
    ...defaultProps,
    viewAs: ViewType.Instructor,
    lessonIsVisible: (lesson, viewAs) =>
      lesson.id !== 2 || viewAs === ViewType.Instructor,
  },
};

export const ThirdLessonHiddenAsInstructor = Template.bind({});
ThirdLessonHiddenAsInstructor.args = {
  store: createStoreWithHiddenLesson(ViewType.Instructor, '3'),
  props: {
    ...defaultProps,
    viewAs: ViewType.Instructor,
    lessonIsVisible: (lesson, viewAs) =>
      lesson.id !== 3 || viewAs === ViewType.Instructor,
  },
};

// Row 2 should not be visible.
export const SecondLessonHiddenAsParticipant = Template.bind({});
SecondLessonHiddenAsParticipant.args = {
  store: createStoreWithHiddenLesson(ViewType.Participant, '2'),
  props: {
    ...defaultProps,
    lessonIsVisible: (lesson, viewAs) =>
      lesson.id !== 2 || viewAs === ViewType.Instructor,
  },
};

// Row 3 should not be visible, gray still every other row.
export const ThirdRowHiddenAsParticipant = Template.bind({});
ThirdRowHiddenAsParticipant.args = {
  store: createStoreWithHiddenLesson(ViewType.Participant, '3'),
  props: {
    ...defaultProps,
    lessonIsVisible: (lesson, viewAs) =>
      lesson.id !== 3 || viewAs === ViewType.Instructor,
  },
};

export const LockedLessonCurrentSectionAsInstructor = Template.bind({});
LockedLessonCurrentSectionAsInstructor.args = {
  store: createStoreWithLockedLesson(ViewType.Instructor, true),
  props: {
    ...defaultProps,
    groupedLesson: {
      lessons: [
        fakeLesson('Jigsaw', 1, false, 1),
        fakeLesson('Assessment One', 2, true),
        fakeLesson('Artist', 3, false, 2),
      ],
      levelsByLesson: [fakeLevels(3), fakeLevels(4), fakeLevels(2)],
    },
    viewAs: ViewType.Instructor,
  },
};

export const LockedLessonAsParticipant = Template.bind({});
LockedLessonAsParticipant.args = {
  store: createStoreWithLockedLesson(ViewType.Participant),
  props: {
    ...defaultProps,
    groupedLesson: {
      lessons: [
        fakeLesson('Jigsaw', 1, false, 1),
        fakeLesson('Assessment One', 2, true),
        fakeLesson('Artist', 3, false, 2),
      ],
      levelsByLesson: [
        fakeLevels(3),
        fakeLevels(4).map(level => ({
          ...level,
          isLocked: true,
        })),
        fakeLevels(2),
      ],
    },
  },
};

export const UnlockedLessonCurrentSectionAsInstructor = Template.bind({});
UnlockedLessonCurrentSectionAsInstructor.args = {
  store: createStoreWithLockedLesson(ViewType.Instructor, true),
  props: {
    ...defaultProps,
    groupedLesson: {
      lessons: [
        fakeLesson('Jigsaw', 1, false, 1),
        fakeLesson('Assessment One', 2, true),
        fakeLesson('Artist', 3, false, 2),
      ],
      levelsByLesson: [fakeLevels(3), fakeLevels(4), fakeLevels(2)],
    },
    viewAs: ViewType.Instructor,
    lessonIsVisible: () => true,
  },
};

export const LockedHiddenLessonAsInstructor = Template.bind({});
LockedHiddenLessonAsInstructor.args = {
  store: createStoreWithHiddenLesson(ViewType.Instructor, '2'),
  props: {
    ...defaultProps,
    groupedLesson: {
      lessons: [
        fakeLesson('Jigsaw', 1, false, 1),
        fakeLesson('Assessment One', 2, true),
        fakeLesson('Artist', 3, false, 2),
      ],
      levelsByLesson: [fakeLevels(3), fakeLevels(4), fakeLevels(2)],
    },
    viewAs: ViewType.Instructor,
    lessonIsVisible: (lesson, viewAs) =>
      lesson.id !== 2 || viewAs === ViewType.Instructor,
  },
};

export const UnpluggedLesson = Template.bind({});
UnpluggedLesson.args = {
  store: createStoreWithHiddenLesson(ViewType.Instructor, null),
  props: {
    ...defaultProps,
    groupedLesson: {
      lessons: [fakeLesson('Lesson with Unplugged', 1, false, 1)],
      levelsByLesson: [[fakeLevel({isUnplugged: true}), ...fakeLevels(3)]],
    },
  },
};
