import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedTopInstructions as TopInstructions} from '@cdo/apps/templates/instructions/TopInstructions';
import TopInstructionsCSP from '@cdo/apps/templates/instructions/TopInstructionsCSP';

const DEFAULT_PROPS = {
  shortInstructions: 'Example instructions',
  hidden: false,
  noInstructionsWhenCollapsed: false
};

describe('TopInstructions', () => {
  it('is a TopInstructionsCSP if instructions to display and not hidden', () => {
    const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} />);
    expect(wrapper).to.containMatchingElement(<TopInstructionsCSP />);
  });

  it('is an empty div if passed the "hidden" property', () => {
    const wrapper = shallow(<TopInstructions {...DEFAULT_PROPS} hidden />);
    expect(wrapper).to.containMatchingElement(<div />);
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
    expect(wrapper).to.containMatchingElement(<div />);
  });
});
