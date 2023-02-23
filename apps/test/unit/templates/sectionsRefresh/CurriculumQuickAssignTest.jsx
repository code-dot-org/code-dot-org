import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import CurriculumQuickAssign from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';

describe('CurriculumQuickAssign', () => {
  it('renders headers and the top row of buttons', () => {
    const wrapper = shallow(<CurriculumQuickAssign />);

    expect(wrapper.find('h3').length).to.equal(1);
    expect(wrapper.find('h5').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(4);
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().text
    ).to.equal(i18n.courseBlocksGradeBandsElementary());
    expect(
      wrapper
        .find('Button')
        .at(1)
        .props().text
    ).to.equal(i18n.courseBlocksGradeBandsMiddle());
    expect(wrapper.find('input').length).to.equal(1);
  });

  it('updates caret direction when clicked', () => {
    const wrapper = shallow(<CurriculumQuickAssign />);

    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().icon
    ).to.equal('caret-down');
    wrapper
      .find('Button')
      .at(0)
      .simulate('click');
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().icon
    ).to.equal('caret-up');
  });

  it('clears decide later when marketing audience selected', () => {
    const wrapper = mount(<CurriculumQuickAssign />);

    expect(wrapper.find('input').props().checked).to.equal(false);
    wrapper.find('input').simulate('change');
    expect(wrapper.find('input').props().checked).to.equal(true);

    // Now, click on elementary school button and verify checkbox is deselected
    wrapper
      .find('Button')
      .at(0)
      .simulate('click');
    expect(wrapper.find('input').props().checked).to.equal(false);
  });
});
