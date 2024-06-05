import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {
  fakeLessonWithLevels,
  fakeLesson,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import LessonDataCell from '@cdo/apps/templates/sectionProgressV2/LessonDataCell.jsx';
import LessonProgressColumnHeader from '@cdo/apps/templates/sectionProgressV2/LessonProgressColumnHeader.jsx';
import {UnconnectedLessonProgressDataColumn} from '@cdo/apps/templates/sectionProgressV2/LessonProgressDataColumn.jsx';

import {expect} from '../../../util/reconfiguredChai';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSON = fakeLessonWithLevels({}, 1);
const LEVEL = LESSON.levels[0];
const LESSON_PROGRESS = {
  [STUDENT_1.id]: {
    [LESSON.id]: {
      incompletePercent: 20,
      imperfectPercent: 20,
      completedPercent: 60,
      timeSpent: 300, // time spent = 5 minutes
      lastTimestamp: 1614841198, // date = 3/4
    },
  },
  [STUDENT_2.id]: {
    [LESSON.id]: {
      incompletePercent: 0,
      imperfectPercent: 0,
      completedPercent: 100,
      timeSpent: 300, // time spent = 5 minutes
      lastTimestamp: 1614841198, // date = 3/4
    },
  },
};
const LEVEL_PROGRESS = {
  [STUDENT_1.id]: {
    [LEVEL.id]: {
      locked: false,
      status: 'perfect',
      result: 100,
      paired: true,
      teacherFeedbackNew: false,
    },
  },
  [STUDENT_2.id]: {
    [LESSON.id]: {
      locked: true,
      status: 'not_tried',
      result: 1,
      paired: false,
      teacherFeedbackNew: true,
    },
  },
};

const DEFAULT_PROPS = {
  lesson: LESSON,
  lessonProgressByStudent: LESSON_PROGRESS,
  levelProgressByStudent: LEVEL_PROGRESS,
  sortedStudents: STUDENTS,
  addExpandedLesson: () => {},
  expandedMetadataStudentIds: [],
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<UnconnectedLessonProgressDataColumn {...props} />);
};

describe('LessonProgressDataColumn', () => {
  it('Shows header lesson', () => {
    const wrapper = setUp();

    expect(wrapper.find(LessonProgressColumnHeader)).to.have.length(1);
  });

  it('Shows no expansion if no levels', () => {
    const wrapper = setUp({lesson: fakeLesson()});

    expect(wrapper.find('FontAwesome')).to.have.length(0);
  });

  it('shows progress for all students', () => {
    const wrapper = setUp();

    expect(wrapper.find(LessonDataCell)).to.have.length(STUDENTS.length);
  });
});
