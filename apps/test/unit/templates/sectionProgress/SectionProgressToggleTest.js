import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedSectionProgressToggle} from '@cdo/apps/templates/sectionProgress/SectionProgressToggle';
import {ViewType} from '@cdo/apps/templates/sectionProgress/sectionProgressConstants';

describe('SectionProgressToggle', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      showStandardsToggle: true,
      setCurrentView: () => {},
      sectionId: 1,
      currentView: ViewType.STANDARDS
    };
  });

  it('standards toggle shows for CSF', () => {
    const wrapper = mount(
      <UnconnectedSectionProgressToggle {...DEFAULT_PROPS} />
    );
    expect(wrapper.find('#uitest-standards-toggle').exists()).to.be.true;
  });

  it('standards toggle does not shows for non-CSF', () => {
    const wrapper = shallow(
      <UnconnectedSectionProgressToggle
        {...DEFAULT_PROPS}
        showStandardsToggle={false}
      />
    );
    expect(wrapper.find('#uitest-standards-toggle').exists()).to.be.false;
  });
});
