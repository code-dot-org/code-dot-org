import React from 'react';
import {mount} from 'enzyme';
import {assert, expect} from '../../util/reconfiguredChai';
import CheckboxDropdown from '@cdo/apps/templates/CheckboxDropdown';

describe('CheckboxDropdown', function () {
  const defaultProps = {
    name: 'colors',
    label: 'Colors',
    allOptions: {
      red: 'Red',
      green: 'Green',
      blue: 'Blue',
      yellow: 'Yellow',
      pink: 'Pink',
      black: 'Black',
    },
    checkedOptions: [],
    onChange: () => {},
  };

  it('renders all checkboxes with none checked by default', function () {
    const wrapper = mount(<CheckboxDropdown {...defaultProps} />);
    const checkboxes = wrapper.find('input');

    expect(checkboxes).to.have.lengthOf(
      Object.keys(defaultProps.allOptions).length
    );
    checkboxes.forEach(checkbox => assert(!checkbox.props().checked));
  });

  it('renders all checkboxes with checkedOptions already checked', function () {
    const propsWithCheckedOptions = {
      ...defaultProps,
      checkedOptions: ['green', 'pink', 'black'],
    };
    const wrapper = mount(<CheckboxDropdown {...propsWithCheckedOptions} />);
    const checkboxes = wrapper.find('input');

    expect(checkboxes).to.have.lengthOf(
      Object.keys(defaultProps.allOptions).length
    );
    checkboxes.forEach(checkbox => {
      expect(checkbox.props().checked).to.equal(
        propsWithCheckedOptions.checkedOptions.includes(checkbox.props().value)
      );
    });
  });
});
