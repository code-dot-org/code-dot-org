import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import SelectedStudentInfo from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentInfo';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const LEVEL_WITH_PROGRESS = {
  id: '123',
  assessment: null,
  contained: false,
  driver: null,
  isConceptLevel: false,
  levelNumber: 4,
  navigator: null,
  paired: null,
  passed: false,
  status: LevelStatus.not_tried,
  userId: 1
};

const DEFAULT_PROPS = {
  students: [{id: 1, name: 'Student 1'}, {id: 2, name: 'Student 2'}],
  selectedStudent: {id: 1, name: 'Student 1'},
  levelWithProgress: LEVEL_WITH_PROGRESS,
  onSelectUser: () => {},
  getSelectedUserId: () => {}
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<SelectedStudentInfo {...props} />);
};

describe('SelectedStudentInfo', () => {
  it('displays name and bubble no matter level type', () => {
    const wrapper = setUp();
    expect(wrapper.contains('Student 1')).to.equal(true);
    expect(wrapper.find('ProgressBubble')).to.have.length(1);
  });

  // levelWithProgress data is loaded async, this test ensures the component handles missing data
  it('displays student name, gracefully handles missing userLevel', () => {
    const wrapper = setUp({levelWithProgress: null});
    expect(wrapper.contains('Student 1')).to.equal(true);
    expect(wrapper.find('ProgressBubble')).to.have.length(0);
  });

  it('displays time and unsubmit button if submitted level', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      submitLevel: true,
      submitted: true,
      status: LevelStatus.submitted
    };
    const wrapper = setUp({levelWithProgress});
    expect(wrapper.contains('Submitted On:')).to.equal(true);
    expect(wrapper.find('Button')).to.have.length(1);
  });

  it('displays time and clear response button if contained level', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      contained: true,
      status: LevelStatus.perfect
    };
    const wrapper = setUp({levelWithProgress});

    expect(wrapper.contains('Last Updated:')).to.equal(true);
  });

  it('displays time and who they worked with as navigator if paired as driver on level', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      paired: true,
      status: LevelStatus.perfect,
      navigator: 'Student 2'
    };
    const wrapper = setUp({levelWithProgress});

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Partner: Student 2')).to.equal(true);
    expect(wrapper.contains('Last Updated:')).to.equal(true);
  });

  it('displays time and who they worked with as driver if paired as navigator on level', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      paired: true,
      status: LevelStatus.perfect,
      driver: 'Student 2'
    };
    const wrapper = setUp({levelWithProgress});

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Logged in: Student 2')).to.equal(true);
    expect(wrapper.contains('Last Updated:')).to.equal(true);
  });
});
