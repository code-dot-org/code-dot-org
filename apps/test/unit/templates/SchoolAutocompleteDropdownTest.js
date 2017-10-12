import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import SchoolAutocompleteDropdown from '@cdo/apps/templates/SchoolAutocompleteDropdown';

describe('SchoolAutocompleteDropdown', () => {
  it('renders VirtualizedSelect', () => {
    const wrapper = shallow(
      <SchoolAutocompleteDropdown
        showErrorMsg={false}
      />
    );
    expect(wrapper.find('VirtualizedSelect').exists()).to.be.true;
  });
});
