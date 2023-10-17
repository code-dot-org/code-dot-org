import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SectionCreationCelebrationDialog from '@cdo/apps/templates/sectionsRefresh/SectionCreationCelebrationDialog';

describe('SectionCreationCelebrationDialog', () => {
  it('renders dialog with gif', () => {
    const wrapper = shallow(<SectionCreationCelebrationDialog />);
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('BaseDialog').at(0).props().isOpen).to.be.true;
    expect(wrapper.find('img').length).to.equal(1);
  });

  it('closes when Go To Dashboard button is clicked', () => {
    const wrapper = shallow(<SectionCreationCelebrationDialog />);
    expect(wrapper.find('BaseDialog').length).to.equal(1);
    expect(wrapper.find('BaseDialog').at(0).props().isOpen).to.be.true;
    wrapper.find('Button').invoke('onClick')();
    expect(wrapper.find('BaseDialog').at(0).props().isOpen).to.be.false;
  });
});
