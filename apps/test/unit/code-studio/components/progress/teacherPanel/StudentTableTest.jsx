import React from 'react';
import DCDO from '@cdo/apps/dcdo';
import {shallow} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import {UnconnectedStudentTable as StudentTable} from '@cdo/apps/code-studio/components/progress/teacherPanel/StudentTable';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';
import i18n from '@cdo/locale';
import sinon from 'sinon';

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
    expect(wrapper.contains(i18n.studentTableTeacherDemo())).to.be.true;
  });

  it('display bubbles for each student when there are levels with progress', () => {
    const wrapper = setUp({levelsWithProgress});
    expect(wrapper.find('ProgressBubble')).to.have.length(2);
  });

  it('does not display bubbles when no levels', () => {
    const wrapper = setUp();
    expect(wrapper.find('ProgressBubble')).to.have.length(0);
  });

  it('calls onSelectUser when row is clicked', () => {
    const onSelectUserStub = sinon.stub();
    const wrapper = setUp({levelsWithProgress, onSelectUser: onSelectUserStub});

    const firstStudentRow = wrapper.find('tr').at(1);
    firstStudentRow.simulate('click');

    expect(onSelectUserStub).to.have.been.calledWith(1);
  });

  it('sorts by display name by default', () => {
    const wrapper = setUp();

    const firstStudentRow = wrapper.find('tr').at(1);
    expect(firstStudentRow.text()).to.match(/^Student 1/);
  });

  it('sorts by family name if toggled', () => {
    DCDO.reset();
    DCDO.set('family-name-features', true);

    const wrapper = setUp({isSortedByFamilyName: true});

    const firstStudentRow = wrapper.find('tr').at(1);
    expect(firstStudentRow.text()).to.match(/^Student 2 FamNameA/);

    DCDO.reset();
  });

  it('sorts null family names last', () => {
    DCDO.reset();
    DCDO.set('family-name-features', true);

    const wrapper = setUp({
      students: [
        {id: 1, name: 'Student 1', familyName: 'FamNameB'},
        {id: 2, name: 'Student 2'},
        {id: 3, name: 'Student 3', familyName: 'ZFamNameA'},
      ],
      isSortedByFamilyName: true,
    });

    const lastStudentRow = wrapper.find('tr').at(3);
    expect(lastStudentRow.text()).to.match(/^Student 2/);
    expect(lastStudentRow.text()).to.not.match(/null/);
    expect(lastStudentRow.text()).to.not.match(/undefined/);

    DCDO.reset();
  });

  it('ignores non-alphabetic characters in sorting', () => {
    DCDO.reset();
    DCDO.set('family-name-features', true);

    const wrapper = setUp({
      students: [
        {id: 1, name: 'Student 1', familyName: '1Brown'},
        {id: 2, name: 'Student 2', familyName: '!Charles'},
        {id: 3, name: 'Student 3', familyName: 'Adams'},
      ],
      isSortedByFamilyName: true,
    });

    const studentRows = wrapper.find('tr');
    expect(studentRows.at(1).text()).to.match(/^Student 3/);
    expect(studentRows.at(2).text()).to.match(/^Student 1/);
    expect(studentRows.at(3).text()).to.match(/^Student 2/);
    DCDO.reset();
  });

  it('sorts by name when family names are equivalent', () => {
    DCDO.reset();
    DCDO.set('family-name-features', true);

    const wrapper = setUp({
      students: [
        {id: 1, name: 'Eve', familyName: 'Carlson'},
        {id: 2, name: 'Alice', familyName: 'Carlson'},
        {id: 3, name: 'Bob', familyName: 'Carlson'},
      ],
      isSortedByFamilyName: true,
    });

    const studentRows = wrapper.find('tr');
    expect(studentRows.at(1).text()).to.match(/^Alice/);
    expect(studentRows.at(2).text()).to.match(/^Bob/);
    expect(studentRows.at(3).text()).to.match(/^Eve/);
    DCDO.reset();
  });
});
