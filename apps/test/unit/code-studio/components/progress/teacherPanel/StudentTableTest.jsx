import React from 'react';
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
    {id: 3, name: 'Student 3', familyName: null},
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
  {
    id: '33',
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
    userId: 3,
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
    const wrapper = setUp({isSortedByFamilyName: true});

    const firstStudentRow = wrapper.find('tr').at(1);
    expect(firstStudentRow.text()).to.match(/^Student 2/);
  });
});
