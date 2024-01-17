import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedProgressTableV2} from '@cdo/apps/templates/sectionProgressV2/ProgressTableV2.jsx';

import StudentColumn from '@cdo/apps/templates/sectionProgressV2/StudentColumn.jsx';
import ProgressTableHeader from '@cdo/apps/templates/sectionProgressV2/ProgressTableHeader.jsx';
import ProgressDataV2 from '@cdo/apps/templates/sectionProgressV2/ProgressDataV2.jsx';

import {
  fakeLessonWithLevels,
  fakeScriptData,
} from '@cdo/apps/templates/progress/progressTestHelpers';

const LESSON_1 = fakeLessonWithLevels({position: 1});
const LESSON_2 = fakeLessonWithLevels({position: 2}, 2);

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSONS = [LESSON_1, LESSON_2];
const DEFAULT_PROPS = {
  students: STUDENTS,
  sectionId: 1,
  unitData: fakeScriptData({lessons: LESSONS}),
  isSortedByFamilyName: false,
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<UnconnectedProgressTableV2 {...props} />);
};

describe('ProgressTableV2', () => {
  it('shows header', () => {
    const wrapper = setUp();

    expect(wrapper.find(ProgressTableHeader)).to.have.length(1);
    expect(wrapper.find(ProgressTableHeader).props().lessons).to.equal(LESSONS);
  });

  it('sorts by display name by default', () => {
    const wrapper = setUp();

    expect(wrapper.find(StudentColumn).props().sortedStudents[0]).to.equal(
      STUDENT_1
    );
    expect(wrapper.find(ProgressDataV2).props().sortedStudents[0]).to.equal(
      STUDENT_1
    );
  });

  it('sorts by family name if toggled', () => {
    const wrapper = setUp({isSortedByFamilyName: true});

    expect(wrapper.find(StudentColumn).props().sortedStudents[0]).to.equal(
      STUDENT_2
    );
    expect(wrapper.find(ProgressDataV2).props().sortedStudents[0]).to.equal(
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
});
