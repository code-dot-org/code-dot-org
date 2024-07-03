import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import {Checkbox} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import sinon from 'sinon';

import SingleCheckbox from '@cdo/apps/code-studio/pd/form_components/SingleCheckbox';



describe('SingleCheckbox', () => {
  it('renders a basic checkbox', () => {
    const singleCheckbox = shallow(
      <SingleCheckbox name="testCheckbox" label="This is the label" />
    );

    expect(
      singleCheckbox.containsMatchingElement(
        <Checkbox>This is the label</Checkbox>
      )
    ).toBeTruthy();
  });

  it('displays checked value', () => {
    const singleCheckBoxWithValue = value =>
      shallow(
        <SingleCheckbox
          name="testCheckbox"
          label="This is the label"
          value={value}
        />
      );

    expect(singleCheckBoxWithValue(true).find(Checkbox).prop('checked')).toBe(true);
    expect(singleCheckBoxWithValue(false).find(Checkbox).prop('checked')).toBe(false);
  });

  it('Calls supplied onChange function with the updated value', () => {
    const onChangeCallback = sinon.spy();
    const singleCheckbox = shallow(
      <SingleCheckbox
        name="testCheckbox"
        label="This is the label"
        onChange={onChangeCallback}
      />
    );

    singleCheckbox
      .find('Checkbox')
      .simulate('change', {target: {checked: true}});
    expect(onChangeCallback).toHaveBeenCalledTimes(1);
    expect(onChangeCallback).toHaveBeenCalledWith({testCheckbox: true});

    onChangeCallback.resetHistory();
    singleCheckbox
      .find('Checkbox')
      .simulate('change', {target: {checked: false}});
    expect(onChangeCallback).toHaveBeenCalledTimes(1);
    expect(onChangeCallback).toHaveBeenCalledWith({testCheckbox: false});
  });
});
