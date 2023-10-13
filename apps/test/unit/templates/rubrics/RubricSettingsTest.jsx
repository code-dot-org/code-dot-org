import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import RubricSettings from '@cdo/apps/templates/rubrics/RubricSettings';

describe('RubricSettings', () => {
  it('shows a a button for running analysis if canProvideFeedback is true', () => {
    const wrapper = shallow(
      <RubricSettings
        canProvideFeedback={true}
        teacherHasEnabledAi={true}
        updateTeacherAiSetting={() => {}}
        visible
      />
    );
    expect(wrapper.find('Button')).to.have.lengthOf(1);
  });
});
