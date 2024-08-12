import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedStudentTable as StudentTable} from '@cdo/apps/code-studio/components/progress/teacherPanel/StudentTable';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  students: [
    {id: 1, name: 'Student 1', familyName: 'FamNameB'},
    {id: 2, name: 'Student 2', familyName: 'FamNameA'},
  ],
  onSelectUser: () => {},
  getSelectedUserId: () => {},
  levelsWithProgress: [],
  sectionId: 1,
  unitName: 'A Unit',
  isSortedByFamilyName: false,
};

const levelsWithProgress = [
  {
    id: '11',
    assessment: null,
    contained: false,
    driver: null,
    isConceptLevel: false,
    levelNumber: 4,
    navigator: null,
    paired: null,
    passed: false,
    status: LevelStatus.not_tried,
    submitLevel: false,
    userId: 1,
  },
  {
    id: '22',
    assessment: null,
    contained: false,
    driver: null,
    isConceptLevel: false,
    levelNumber: 4,
    navigator: null,
    paired: null,
    passed: false,
    status: LevelStatus.not_tried,
    submitLevel: false,
    userId: 2,
  },
];

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<StudentTable {...props} />);
};

describe('StudentTable', () => {
  it('displays a row for the teacher', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.studentTableTeacherDemo())).toBe(true);
  });

  it('display bubbles for each student when there are levels with progress', () => {
    const wrapper = setUp({levelsWithProgress});
    expect(wrapper.find('ProgressBubble')).toHaveLength(2);
  });

  it('does not display bubbles when no levels', () => {
    const wrapper = setUp();
    expect(wrapper.find('ProgressBubble')).toHaveLength(0);
  });

  it('calls onSelectUser when row is clicked', () => {
    const onSelectUserStub = jest.fn();
    const wrapper = setUp({levelsWithProgress, onSelectUser: onSelectUserStub});

    const firstStudentRow = wrapper.find('tr').at(1);
    firstStudentRow.simulate('click');

    expect(onSelectUserStub).toHaveBeenCalledWith(1);
  });

  it('sorts by display name by default', () => {
    const wrapper = setUp();

    const firstStudentRow = wrapper.find('tr').at(1);
    expect(firstStudentRow.text()).toMatch(/^Student 1/);
  });

  it('sorts by family name if toggled', () => {
    const wrapper = setUp({isSortedByFamilyName: true});

    const firstStudentRow = wrapper.find('tr').at(1);
    expect(firstStudentRow.text()).toMatch(/^Student 2 FamNameA/);
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

    const lastStudentRow = wrapper.find('tr').at(3);
    expect(lastStudentRow.text()).toMatch(/^Student 2/);
    expect(lastStudentRow.text()).not.toMatch(/null/);
    expect(lastStudentRow.text()).not.toMatch(/undefined/);
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

    const studentRows = wrapper.find('tr');
    expect(studentRows.at(1).text()).toMatch(/^Student 4/);
    expect(studentRows.at(2).text()).toMatch(/^Student 3/);
    expect(studentRows.at(3).text()).toMatch(/^Student 1/);
    expect(studentRows.at(4).text()).toMatch(/^Student 2/);
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

    const studentRows = wrapper.find('tr');
    expect(studentRows.at(1).text()).toMatch(/^Alice/);
    expect(studentRows.at(2).text()).toMatch(/^Bob/);
    expect(studentRows.at(3).text()).toMatch(/^Eve/);
  });
});
