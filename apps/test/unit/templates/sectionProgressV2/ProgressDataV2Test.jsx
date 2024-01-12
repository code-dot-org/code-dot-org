import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedProgressDataV2} from '@cdo/apps/templates/sectionProgressV2/ProgressDataV2';
import LessonDataCell from '@cdo/apps/templates/sectionProgressV2/LessonDataCell';
import styles from '@cdo/apps/templates/sectionProgressV2/progress-table-v2.module.scss';

const STUDENT_DATA = [
  {id: 0, name: 'studenta'},
  {id: 1, name: 'studentb'},
  {id: 2, name: 'studentc'},
];

const PROGRESS_INCOMPLETE = {
  incompletePercent: 20,
  imperfectPercent: 20,
  completedPercent: 60,
  timeSpent: 300, // time spent = 5 minutes
  lastTimestamp: 1614841198, // date = 3/4
};
const PROGRESS_COMPLETE = {
  incompletePercent: 0,
  imperfectPercent: 0,
  completedPercent: 100,
  timeSpent: 300, // time spent = 5 minutes
  lastTimestamp: 1614841198, // date = 3/4
};

describe('ProgressDataV2', () => {
  const DEFAULT_PROPS = {
    sortedStudents: STUDENT_DATA,
    lessonProgressByStudent: {
      0: {11: PROGRESS_INCOMPLETE, 12: PROGRESS_COMPLETE},
      1: {11: PROGRESS_COMPLETE, 12: PROGRESS_COMPLETE},
      2: {11: PROGRESS_INCOMPLETE, 12: PROGRESS_COMPLETE},
    },
    lessons: [{id: 11}, {id: 12}],
  };
  const setUp = (overrideProps = {}) => {
    return shallow(
      <UnconnectedProgressDataV2 {...DEFAULT_PROPS} {...overrideProps} />
    );
  };

  it('shows a column for each lesson', () => {
    const wrapper = setUp();
    expect(wrapper.find(`.${styles.dataColumn}`).length).to.equal(2);
  });

  it('shows a cell for each lesson and student', () => {
    const wrapper = setUp();
    expect(wrapper.find(LessonDataCell)).to.have.length(6);
    expect(wrapper.find(LessonDataCell).at(0).props().studentId).to.equal(0);
    expect(wrapper.find(LessonDataCell).at(0).props().lesson['id']).to.equal(
      11
    );
    expect(
      wrapper.find(LessonDataCell).at(0).props().studentLessonProgress
    ).to.equal(PROGRESS_INCOMPLETE);
  });
});
