import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import SectionsSetUp from '@cdo/apps/templates/sectionsRefresh/SectionsSetUp';

describe('SectionsSetUp', () => {
  it('renders an initial set up section form', () => {
    const wrapper = shallow(<SectionsSetUp />);

    expect(wrapper.find('SetUpSectionForm').length).to.equal(1);
  });

  it('renders headers and button', () => {
    const wrapper = shallow(<SectionsSetUp />);

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
});
