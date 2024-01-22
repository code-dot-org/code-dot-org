import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';

import {UnconnectedLessonProgressDataColumn} from '@cdo/apps/templates/sectionProgressV2/LessonProgressDataColumn.jsx';
import LessonDataCell from '@cdo/apps/templates/sectionProgressV2/LessonDataCell.jsx';

import {
  fakeLessonWithLevels,
  fakeLesson,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSON = fakeLessonWithLevels({}, 1);
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

const DEFAULT_PROPS = {
  lesson: LESSON,
  lessonProgressByStudent: LESSON_PROGRESS,
  sortedStudents: STUDENTS,
  addExpandedLesson: () => {},
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<UnconnectedLessonProgressDataColumn {...props} />);
};

describe('LessonProgressDataColumn', () => {
  it('Shows header lesson', () => {
    const wrapper = setUp();

    expect(wrapper.find(`.${styles.lessonHeaderCell}`)).to.have.length(1);
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
