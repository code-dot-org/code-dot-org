import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import SortByNameDropdown from '@cdo/apps/templates/SortByNameDropdown';

describe('SortByNameDropdown', () => {
  it('renders dropdown', () => {
    const wrapper = shallow(<SortByNameDropdown />);
    expect(wrapper.find('select').length).to.equal(1);
  });

  /*
  TODO: Reenable this test when using localStorage to make preference persist
  it('makes call to update familyName sorting in localStorage', () => {
    localStorage.setItem('sortByFamilyName', 'false');
    const wrapper = shallow(<SortByNameDropdown />);
    wrapper.find('select').simulate('change', {value: 'true'});
    expect(localStorage.getItem('sortByFamilyName')).to.equal('true');
  });
  */
});
