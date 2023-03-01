import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SectionsSetUpContainer from '@cdo/apps/templates/sectionsRefresh/SectionsSetUpContainer';

describe('SectionsSetUpContainer', () => {
  it('renders an initial set up section form', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('SingleSectionSetUp').length).to.equal(1);
  });

  it('renders headers and button', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('h1').length).to.equal(1);
    expect(wrapper.find('Button').length).to.equal(2);
    expect(
      wrapper
        .find('Button')
        .at(0)
        .props().text
    ).to.equal('Add Another Class Section');
    expect(
      wrapper
        .find('Button')
        .at(1)
        .props().text
    ).to.equal('Save class sections');
  });

  it('renders curriculum quick assign', () => {
    const wrapper = shallow(<SectionsSetUpContainer />);

    expect(wrapper.find('CurriculumQuickAssign').length).to.equal(1);
  });
});
