import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedProgressTableV2} from '@cdo/apps/templates/sectionProgressV2/ProgressTableV2.jsx';

import LessonsProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/LessonsProgressDataColumn.jsx';
import ExpandedProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/ExpandedProgressDataColumn.jsx';
import StudentColumn from '@cdo/apps/templates/sectionProgressV2/StudentColumn.jsx';

import {
  fakeLessonWithLevels,
  fakeScriptData,
} from '@cdo/apps/templates/progress/progressTestHelpers';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSONS = [1, 2, 3, 4, 5].map(index =>
  fakeLessonWithLevels({position: index}, index)
);
const DEFAULT_PROPS = {
  students: STUDENTS,
  sectionId: 1,
  unitData: fakeScriptData({lessons: LESSONS}),
  isSortedByFamilyName: false,
  expandedLessonIds: [],
  setExpandedLessons: () => {},
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<UnconnectedProgressTableV2 {...props} />);
};

describe('ProgressTableV2', () => {
  it('sorts by display name by default', () => {
    const wrapper = setUp();

    expect(wrapper.find(StudentColumn).props().sortedStudents[0]).to.equal(
      STUDENT_1
    );
  });

  it('sorts by family name if toggled', () => {
    const wrapper = setUp({isSortedByFamilyName: true});

    expect(wrapper.find(StudentColumn).props().sortedStudents[0]).to.equal(
      STUDENT_2
    );
  });

  it('sorts null family names last', () => {
    const wrapper = setUp({
      students: [
        {id: 1, name: 'Student 1', familyName: 'FamNameB'},
        {id: 2, name: 'Student 2'},
        {id: 3, name: 'Student 3', familyName: 'ZFamNameA'},
      ],
      isSortedByFamilyName: true,
    });

    const sortedStudentIds = wrapper
      .find(StudentColumn)
      .props()
      .sortedStudents.map(student => student.id);
    expect(sortedStudentIds).to.eql([1, 3, 2]);
  });

  it('includes non-alphabetic characters in sorting', () => {
    const wrapper = setUp({
      students: [
        {id: 1, name: 'Student 1', familyName: '2Brown'},
        {id: 2, name: 'Student 2', familyName: 'Delta'},
        {id: 3, name: 'Student 3', familyName: '1Adams'},
        {id: 4, name: 'Student 4', familyName: '!Charles'},
      ],
      isSortedByFamilyName: true,
    });

    const sortedStudentIds = wrapper
      .find(StudentColumn)
      .props()
      .sortedStudents.map(student => student.id);
    expect(sortedStudentIds).to.eql([4, 3, 1, 2]);
  });

  it('sorts by name when family names are equivalent', () => {
    const wrapper = setUp({
      students: [
        {id: 1, name: 'Eve', familyName: 'Carlson'},
        {id: 2, name: 'Alice', familyName: 'Carlson'},
        {id: 3, name: 'Bob', familyName: 'Carlson'},
      ],
      isSortedByFamilyName: true,
    });

    const sortedStudentIds = wrapper
      .find(StudentColumn)
      .props()
      .sortedStudents.map(student => student.id);
    expect(sortedStudentIds).to.eql([2, 3, 1]);
  });

  it('nothing expanded', () => {
    const wrapper = setUp();

    expect(wrapper.find(LessonsProgressDataColumn)).to.have.lengthOf(5);
    expect(wrapper.find(ExpandedProgressDataColumn)).to.have.lengthOf(0);
  });

  it('one lesson expanded', () => {
    const wrapper = setUp({expandedLessonIds: [2]});

    expect(wrapper.find(LessonsProgressDataColumn)).to.have.lengthOf(4);
    expect(wrapper.find(ExpandedProgressDataColumn)).to.have.lengthOf(1);
  });

  it('multiple lessons expanded', () => {
    const wrapper = setUp({expandedLessonIds: [2, 4]});

    expect(wrapper.find(LessonsProgressDataColumn)).to.have.lengthOf(3);
    expect(wrapper.find(ExpandedProgressDataColumn)).to.have.lengthOf(2);
  });
});
