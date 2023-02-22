import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import i18n from '@cdo/locale';
import CurriculumQuickAssign from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';

describe('CurriculumQuickAssign', () => {
  it('renders headers and the top row of buttons', () => {
    const wrapper = shallow(<CurriculumQuickAssign />);

    console.log(wrapper.debug());

    expect(wrapper.find('h2').length).to.equal(1);
    expect(wrapper.find('h5').length).to.equal(2);
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
});
