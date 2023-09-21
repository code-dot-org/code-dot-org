import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {mount, shallow} from 'enzyme';
import sinon from 'sinon';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';

describe('RubricSettings', () => {
  it('shows a toggle for enabling AI features and a button for running analysis if canProvideFeedback is true', () => {
    const wrapper = shallow(
      <RubricSettings
        canProvideFeedback={true}
        teacherHasEnabledAi={true}
        updateTeacherAiSetting={() => {}}
      />
    );
    expect(wrapper.find('Button')).to.have.lengthOf(1);
    expect(wrapper.find('Memo(Toggle)')).to.have.lengthOf(1);
  });

  it('shows only a toggle for enabling AI features if canProvideFeedback is false', () => {
    const wrapper = shallow(
      <RubricSettings
        canProvideFeedback={false}
        teacherHasEnabledAi={true}
        updateTeacherAiSetting={() => {}}
      />
    );
    expect(wrapper.find('Button')).to.have.lengthOf(0);
    expect(wrapper.find('Memo(Toggle)')).to.have.lengthOf(1);
  });

  it('updates the AI features setting when the toggle is clicked', () => {
    const updateTeacherAiSetting = sinon.spy();
    const wrapper = mount(
      <RubricSettings
        canProvideFeedback={true}
        teacherHasEnabledAi={true}
        updateTeacherAiSetting={updateTeacherAiSetting}
      />
    );
    wrapper.find("input[type='checkbox']").simulate('change');
    expect(updateTeacherAiSetting).to.have.been.calledOnce;
  });
});
