import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {SelectedStudentInfo} from '@cdo/apps/code-studio/components/progress/SelectedStudentInfo';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const defaultProps = {
  selectedStudent: {id: 1, name: 'Student 1'},
  level: {
    assessment: null,
    contained: false,
    driver: null,
    isConceptLevel: false,
    levelNumber: 4,
    navigator: null,
    paired: null,
    passed: false,
    status: LevelStatus.not_tried,
    user_id: 1
  },
  inMiniRubricExperiment: false
};

describe('SelectedStudentInfo', () => {
  it('displays name and bubble no matter level type', () => {
    const wrapper = shallow(<SelectedStudentInfo {...defaultProps} />);

    expect(wrapper.contains('Student 1')).to.equal(true);
    expect(wrapper.find('TeacherPanelProgressBubble')).to.have.length(1);
  });

  it('displays time and unsubmit button if submitted level', () => {
    const wrapper = shallow(
      <SelectedStudentInfo
        {...defaultProps}
        level={{
          ...defaultProps.level,
          submitLevel: true,
          submitted: true,
          status: LevelStatus.submitted
        }}
      />
    );

    expect(wrapper.contains('Submitted On:')).to.equal(true);
    expect(wrapper.find('Button')).to.have.length(1);
  });

  it('displays time and clear response button if contained level', () => {
    const wrapper = shallow(
      <SelectedStudentInfo
        {...defaultProps}
        level={{
          ...defaultProps.level,
          contained: true,
          status: LevelStatus.perfect
        }}
      />
    );

    expect(wrapper.contains('Last Updated:')).to.equal(true);
    expect(wrapper.find('Button')).to.have.length(1);
  });

  it('displays time and who they worked with as navigator if paired as driver on level', () => {
    const wrapper = shallow(
      <SelectedStudentInfo
        {...defaultProps}
        level={{
          ...defaultProps.level,
          paired: true,
          status: LevelStatus.perfect,
          navigator: 'Student 2'
        }}
      />
    );

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Partner: Student 2')).to.equal(true);
    expect(wrapper.contains('Last Updated:')).to.equal(true);
  });

  it('displays time and who they worked with as driver if paired as navigator on level', () => {
    const wrapper = shallow(
      <SelectedStudentInfo
        {...defaultProps}
        level={{
          ...defaultProps.level,
          paired: true,
          status: LevelStatus.perfect,
          driver: 'Student 2'
        }}
      />
    );

    expect(wrapper.contains('Worked With:')).to.equal(true);
    expect(wrapper.contains('Logged in: Student 2')).to.equal(true);
    expect(wrapper.contains('Last Updated:')).to.equal(true);
  });
});
