import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../../util/reconfiguredChai';
import SelectedStudentInfo from '@cdo/apps/code-studio/components/progress/teacherPanel/SelectedStudentInfo';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const LEVEL_WITH_PROGRESS = {
  id: '123',
  assessment: null,
  contained: false,
  paired: null,
  partnerNames: null,
  partnerCount: null,
  isConceptLevel: false,
  levelNumber: 4,
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

  it('displays time if paired', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      partnerNames: ['Student 1'],
      partnerCount: 1
    };
    const wrapper = setUp({levelWithProgress});

    expect(wrapper.contains('Last Updated:')).to.equal(true);
  });

  it('does not display partner info if not paired', () => {
    const wrapper = setUp();

    expect(wrapper.contains('Worked With:')).to.equal(false);
  });

  it('displays partner info if paired with 1 partner', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      partnerNames: ['Student 1'],
      partnerCount: 1
    };
    const wrapper = setUp({levelWithProgress});
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Student 1')).to.equal(true);
    expect(tooltip).to.have.lengthOf(0);
  });

  it('displays partner info if paired with 2 partners', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      partnerNames: ['Student 1', 'Student 2'],
      partnerCount: 2
    };
    const wrapper = setUp({levelWithProgress});
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Student 1 + 1')).to.equal(true);
    expect(tooltip).to.have.lengthOf(1);
    expect(tooltip.prop('text')).to.equal('Student 1, Student 2');
  });

  it('displays partner info if paired with 1 unknown partner', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      partnerNames: [],
      partnerCount: 1
    };
    const wrapper = setUp({levelWithProgress});
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('1 other student(s)')).to.equal(true);
    expect(tooltip).to.have.lengthOf(0);
  });

  it('displays partner info if paired with 1 known partner and 1 unknown partner', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      partnerNames: ['Student 1'],
      partnerCount: 2
    };
    const wrapper = setUp({levelWithProgress});
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Student 1 + 1')).to.equal(true);
    expect(tooltip).to.have.lengthOf(1);
    expect(tooltip.prop('text')).to.equal('Student 1 + 1 other student(s)');
  });

  it('displays partner info if paired with 2 known partners and 2 unknown partners', () => {
    const levelWithProgress = {
      ...LEVEL_WITH_PROGRESS,
      status: LevelStatus.perfect,
      paired: true,
      partnerNames: ['Student 1', 'Student 2'],
      partnerCount: 4
    };
    const wrapper = setUp({levelWithProgress});
    const tooltip = wrapper.find('Tooltip');

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Student 1 + 3')).to.equal(true);
    expect(tooltip).to.have.lengthOf(1);
    expect(tooltip.prop('text')).to.equal(
      'Student 1, Student 2 + 2 other student(s)'
    );
  });
});
