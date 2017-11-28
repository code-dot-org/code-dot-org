import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import DiscountCodeSchoolChoice from '@cdo/apps/templates/maker/DiscountCodeSchoolChoice';

describe('DiscountCodeSchoolChoice', () => {
  const defaultProps = {
    schoolConfirmed: false,
    onSchoolConfirmed: () => {},
  };

  it('shows SchoolAutocompleteDropdownWithLabel if school not yet confirmed', () => {
    const wrapper = shallow(
      <DiscountCodeSchoolChoice
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('SchoolAutocompleteDropdownWithLabel').length, 1);
  });

  it('sets value if given an initialSchoolId', () => {
    const wrapper = shallow(
      <DiscountCodeSchoolChoice
        {...defaultProps}
        initialSchoolId="12345"
      />
    );
    assert.equal(wrapper.find('SchoolAutocompleteDropdownWithLabel').props().value, "12345");
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('just shows school name if we have already confirmed school', () => {
    const wrapper = shallow(
      <DiscountCodeSchoolChoice
        {...defaultProps}
        initialSchoolId="12345"
        initialSchoolName="My Great School"
        schoolConfirmed={true}
      />
    );
    assert.equal(wrapper.find('SchoolAutocompleteDropdownWithLabel').length, 0);
    assert.equal(wrapper.text(), 'School NameMy Great School');
  });
});
