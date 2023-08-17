import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../util/reconfiguredChai';
import {getStore} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import SortByNameDropdown from '@cdo/apps/templates/SortByNameDropdown';

describe('SortByNameDropdown', () => {
  it('renders dropdown', () => {
    const store = getStore();
    const wrapper = mount(
      <Provider store={store}>
        <SortByNameDropdown />
      </Provider>
    );
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
