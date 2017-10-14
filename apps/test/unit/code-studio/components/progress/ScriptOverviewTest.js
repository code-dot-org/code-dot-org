import React from 'react';
import { assert } from '../../../../util/configuredChai';
import { shallow } from 'enzyme';
import { UnconnectedScriptOverview as ScriptOverview } from
  '@cdo/apps/code-studio/components/progress/ScriptOverview';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';

const defaultProps = {
  onOverviewPage: true,
  excludeCsfColumnInLegend: true,
  teacherResources: [],
  isSignedIn: true,
  isVerifiedTeacher: true,
  hasVerifiedResources: true,
  perLevelProgress: {},
  scriptCompleted: false,
  scriptId: 123,
  scriptName: 'csp1',
  scriptTitle: 'CSP 1',
  professionalLearningCourse: false,
  viewAs: ViewType.Teacher,
  isRtl: false,
  sectionsInfo: [],
  scriptHasLockableStages: false,
  scriptAllowsHiddenStages: false,
};

describe('ScriptOverview', () => {
  it('includes a ScriptOverviewTopRow/ProgressLegend on overview page', () => {
    const wrapper = shallow(
      <ScriptOverview
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('ScriptOverviewTopRow').length, 1);
    assert.equal(wrapper.find('ProgressLegend').length, 1);
  });

  it('includes no ScriptOverviewTopRow/ProgressLegend if not on overview page', () => {
    const wrapper = shallow(
      <ScriptOverview
        {...defaultProps}
        onOverviewPage={false}
      />
    );
    assert.equal(wrapper.find('ScriptOverviewTopRow').length, 0);
    assert.equal(wrapper.find('ProgressLegend').length, 0);
  });
});
