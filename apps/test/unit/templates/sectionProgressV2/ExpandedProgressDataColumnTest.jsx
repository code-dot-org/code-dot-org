import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';

import {UnconnectedExpandedProgressDataColumn} from '@cdo/apps/templates/sectionProgressV2/ExpandedProgressDataColumn.jsx';
import LevelDataCell from '@cdo/apps/templates/sectionProgressV2/LevelDataCell.jsx';

import {
  fakeLessonWithLevels,
  fakeStudentLevelProgress,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const NUM_LEVELS = 4;
const LESSON = fakeLessonWithLevels({}, NUM_LEVELS);
const LEVEL_PROGRESS = fakeStudentLevelProgress(LESSON.levels, STUDENTS);

const DEFAULT_PROPS = {
  lesson: LESSON,
  levelProgressByStudent: LEVEL_PROGRESS,
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
    expect(wrapper.find(LevelDataCell)).to.have.length(
      STUDENTS.length * NUM_LEVELS
    );
  });

  it('Un-expands on header click', () => {
    const removeExpandedLesson = sinon.spy();
    const wrapper = setUp({removeExpandedLesson: removeExpandedLesson});

    wrapper.find(`.${styles.expandedHeaderLessonCell}`).simulate('click');

    expect(removeExpandedLesson).to.have.been.calledOnceWith(LESSON.id);
  });
});
