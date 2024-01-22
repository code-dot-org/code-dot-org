import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import sinon from 'sinon';

import {UnconnectedExpandedProgressDataColumn} from '@cdo/apps/templates/sectionProgressV2/ExpandedProgressDataColumn.jsx';
import LessonDataCell from '@cdo/apps/templates/sectionProgressV2/LessonDataCell.jsx';

import {fakeLessonWithLevels} from '@cdo/apps/templates/progress/progressTestHelpers';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const NUM_LEVELS = 4;
const LESSON = fakeLessonWithLevels({}, NUM_LEVELS);
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
  removeExpandedLesson: () => {},
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<UnconnectedExpandedProgressDataColumn {...props} />);
};

describe('ExpandedProgressDataColumn', () => {
  it('Shows header with lesson and all levels', () => {
    const wrapper = setUp();

    expect(wrapper.find(`.${styles.expandedHeaderLessonCell}`)).to.have.length(
      1
    );
    expect(wrapper.find(`.${styles.expandedHeaderLevelCell}`)).to.have.length(
      NUM_LEVELS
    );
  });

  it('Shows all levels for all students', () => {
    const wrapper = setUp();
    expect(wrapper.find(LessonDataCell)).to.have.length(STUDENTS.length);
  });

  it('Un-expands on header click', () => {
    const removeExpandedLesson = sinon.spy();
    const wrapper = setUp({removeExpandedLesson: removeExpandedLesson});

    wrapper.find(`.${styles.expandedHeaderLessonCell}`).simulate('click');

    expect(removeExpandedLesson).to.have.been.calledOnceWith(LESSON.id);
  });
});
