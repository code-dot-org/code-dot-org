import React from 'react';
import {assert} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {UnconnectedUnitOverview as UnitOverview} from '@cdo/apps/code-studio/components/progress/UnitOverview';
import ProgressLegend from '@cdo/apps/templates/progress/ProgressLegend';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import experiments from '@cdo/apps/util/experiments';

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
  unitData: {csf: false, isCsp: true, isCsd: false},
  scriptId: 123,
  scriptName: 'csp1',
  unitTitle: 'CSP 1',
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
    assert.equal(wrapper.find(ProgressLegend).length, 1);
  });

  it('passes `includeReviewStates` to ProgressLegend when enabled', () => {
    sinon.stub(experiments, 'isEnabled').returns(true);
    const wrapper = shallow(<UnitOverview {...defaultProps} />);
    assert(wrapper.find(ProgressLegend).props().includeReviewStates);
    sinon.restore();
  });

  it('includes no UnitOverviewTopRow/ProgressLegend if not on overview page', () => {
    const wrapper = shallow(
      <UnitOverview {...defaultProps} onOverviewPage={false} />
    );
    assert.equal(wrapper.find('UnitOverviewTopRow').length, 0);
    assert.equal(wrapper.find(ProgressLegend).length, 0);
  });
});
