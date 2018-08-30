import React from 'react';
import {assert, expect} from '../../../../util/configuredChai';
import { shallow } from 'enzyme';
import { UnconnectedScriptOverview as ScriptOverview } from
  '@cdo/apps/code-studio/components/progress/ScriptOverview';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import LabeledSectionSelector from '@cdo/apps/code-studio/components/progress/LabeledSectionSelector';

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
  versions: [],
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

  it('renders section selector if script has lockable stages', () => {
    const wrapper = shallow(
      <ScriptOverview
        {...defaultProps}
        scriptHasLockableStages={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <LabeledSectionSelector/>
    );
  });

  it('renders section selector if script allows hidden stages', () => {
    const wrapper = shallow(
      <ScriptOverview
        {...defaultProps}
        scriptAllowsHiddenStages={true}
      />
    );
    expect(wrapper).to.containMatchingElement(
      <LabeledSectionSelector/>
    );
  });

});
