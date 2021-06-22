import React from 'react';
import {assert} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {UnconnectedUnitOverview as UnitOverview} from '@cdo/apps/code-studio/components/progress/UnitOverview';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const defaultProps = {
  onOverviewPage: true,
  excludeCsfColumnInLegend: true,
  teacherResources: [],
  studentResources: [],
  isSignedIn: true,
  isVerifiedTeacher: true,
  hasVerifiedResources: true,
  perLevelResults: {},
  unitCompleted: false,
  scriptId: 123,
  scriptName: 'csp1',
  scriptTitle: 'CSP 1',
  professionalLearningCourse: false,
  viewAs: ViewType.Teacher,
  isRtl: false,
  sectionsForDropdown: [],
  unitHasLockableLessons: false,
  unitAllowsHiddenLessons: false,
  versions: []
};

describe('UnitOverview', () => {
  it('includes a UnitOverviewTopRow/ProgressLegend on overview page', () => {
    const wrapper = shallow(<UnitOverview {...defaultProps} />);
    assert.equal(wrapper.find('Connect(UnitOverviewTopRow)').length, 1);
    assert.equal(wrapper.find('Connect(ProgressLegend)').length, 1);
  });

  it('includes no UnitOverviewTopRow/ProgressLegend if not on overview page', () => {
    const wrapper = shallow(
      <UnitOverview {...defaultProps} onOverviewPage={false} />
    );
    assert.equal(wrapper.find('UnitOverviewTopRow').length, 0);
    assert.equal(wrapper.find('ProgressLegend').length, 0);
  });
});
