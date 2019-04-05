import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTopInstructions as TopInstructions} from '@cdo/apps/templates/instructions/TopInstructions';
import TopInstructionsCSF from '@cdo/apps/templates/instructions/TopInstructionsCSF';
import TopInstructionsCSP from '@cdo/apps/templates/instructions/TopInstructionsCSP';

const DEFAULT_PROPS = {
  shortInstructions: 'Example instructions',
  hidden: false,
  noInstructionsWhenCollapsed: false
};

describe('TopInstructions', () => {
  it('is a TopInstructionsCSP if passed the "noInstructionsWhenCollapsed" property', () => {
    const wrapper = shallow(
      <TopInstructions {...DEFAULT_PROPS} noInstructionsWhenCollapsed={true} />
    );
    expect(wrapper.containsMatchingElement(<TopInstructionsCSP />)).to.be.ok;
  });

  it('is a TopInstructionsCSF if not passed the "noInstructionsWhenCollapsed" property', () => {
    const wrapper = shallow(
      <TopInstructions {...DEFAULT_PROPS} noInstructionsWhenCollapsed={false} />
    );
    expect(wrapper.containsMatchingElement(<TopInstructionsCSF />)).to.be.ok;
  });

  it('is an empty div if passed the "hidden" property', () => {
    const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} hidden />);
    expect(wrapper.containsMatchingElement(<div />)).to.be.ok;
  });

  it('is an empty div if there are no instructions to display', () => {
    const wrapper = shallow(
      <TopInstructions
        {...DEFAULT_PROPS}
        shortInstructions={null}
        longInstructions={null}
        hasContainedLevels={false}
      />
    );
    expect(wrapper.containsMatchingElement(<div />)).to.be.ok;
  });
});
