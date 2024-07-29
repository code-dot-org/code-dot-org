import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import CheckboxDropdown from '@cdo/apps/templates/CheckboxDropdown';

describe('CheckboxDropdown', function () {
  const colorOptions = {
    red: 'Red',
    green: 'Green',
    blue: 'Blue',
    yellow: 'Yellow',
    pink: 'Pink',
    black: 'Black',
  };

  const defaultProps = {
    name: 'colors',
    label: 'Colors',
    allOptions: colorOptions,
    checkedOptions: [],
    onChange: () => {},
    handleSelectAll: () => {},
    handleClearAll: () => {},
  };

  const propsWithCheckedOptions = {
    ...defaultProps,
    checkedOptions: ['green', 'pink', 'black'],
  };

  it('renders all checkboxes with none checked by default', function () {
    const wrapper = mount(<CheckboxDropdown {...defaultProps} />);
    const checkboxes = wrapper.find('input');

    expect(checkboxes).toHaveLength(
      Object.keys(defaultProps.allOptions).length
    );
    checkboxes.forEach(checkbox =>
      expect(!checkbox.props().checked).toBeTruthy()
    );
  });

  it('renders all checkboxes with checkedOptions already checked', function () {
    const wrapper = mount(<CheckboxDropdown {...propsWithCheckedOptions} />);
    const checkboxes = wrapper.find('input');

    expect(checkboxes).toHaveLength(
      Object.keys(defaultProps.allOptions).length
    );
    checkboxes.forEach(checkbox => {
      expect(checkbox.props().checked).toBe(
        propsWithCheckedOptions.checkedOptions.includes(checkbox.props().value)
      );
    });
  });

  it('does not render checkmark icon if no options are selected', function () {
    const wrapper = mount(<CheckboxDropdown {...defaultProps} />);
    const checkIcon = wrapper.find('#check-icon');

    expect(!checkIcon.exists()).toBeTruthy();
  });

  it('renders checkmark icon if at least 1 option is selected', function () {
    const wrapper = mount(<CheckboxDropdown {...propsWithCheckedOptions} />);
    const checkIcon = wrapper.find('#check-icon');

    expect(checkIcon.exists()).toBeTruthy();
  });

  it('handleSelectAll funtion is called when SelectAll button is clicked', function () {
    let optionsSelected = [];
    const testHandleSelectAll = () => {
      optionsSelected = Object.keys(colorOptions);
    };
    const propsWithSelectFunction = {
      ...defaultProps,
      checkedOptions: optionsSelected,
      handleSelectAll: testHandleSelectAll,
    };

    const wrapper = mount(<CheckboxDropdown {...propsWithSelectFunction} />);
    const selectAllButton = wrapper.find('button#select-all');

    expect(selectAllButton.exists()).toBeTruthy();
    expect(optionsSelected).toHaveLength(0);
    selectAllButton.simulate('click');
    expect(optionsSelected).toHaveLength(Object.keys(colorOptions).length);
  });

  it('handleClearAll funtion is called when ClearAll button is clicked', function () {
    let optionsSelected = Object.keys(colorOptions);
    const testHandleClearAll = () => {
      optionsSelected = [];
    };
    const propsWithClearFunction = {
      ...defaultProps,
      checkedOptions: optionsSelected,
      handleClearAll: testHandleClearAll,
    };

    const wrapper = mount(<CheckboxDropdown {...propsWithClearFunction} />);
    const clearAllButton = wrapper.find('button#clear-all');

    expect(clearAllButton.exists()).toBeTruthy();
    expect(optionsSelected).toHaveLength(Object.keys(colorOptions).length);
    clearAllButton.simulate('click');
    expect(optionsSelected).toHaveLength(0);
  });
});
