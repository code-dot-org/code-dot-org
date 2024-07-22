import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SectionCreationCelebrationDialog from '@cdo/apps/templates/sectionsRefresh/SectionCreationCelebrationDialog';

describe('SectionCreationCelebrationDialog', () => {
  it('renders dialog with gif', () => {
    const wrapper = shallow(<SectionCreationCelebrationDialog />);
    expect(wrapper.find('BaseDialog').length).toBe(1);
    expect(wrapper.find('BaseDialog').at(0).props().isOpen).toBe(true);
    expect(wrapper.find('img').length).toBe(1);
  });

  it('closes when Go To Dashboard button is clicked', () => {
    const wrapper = shallow(<SectionCreationCelebrationDialog />);
    expect(wrapper.find('BaseDialog').length).toBe(1);
    expect(wrapper.find('BaseDialog').at(0).props().isOpen).toBe(true);
    wrapper.find('Button').invoke('onClick')();
    expect(wrapper.find('BaseDialog').at(0).props().isOpen).toBe(false);
  });
});
