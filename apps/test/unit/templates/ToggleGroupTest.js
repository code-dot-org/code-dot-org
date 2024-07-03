import { shallow } from 'enzyme';
import React from 'react';

import ToggleButton from '@cdo/apps/templates/ToggleButton';
import {UnconnectedToggleGroup as ToggleGroup} from '@cdo/apps/templates/ToggleGroup';

describe('ToggleGroup', function () {
  let wrapper, onChange;

  beforeEach(function () {
    onChange = jest.fn();
    const group = (
      <ToggleGroup selected="one" onChange={onChange}>
        <button type="button" value="one">
          One
        </button>
        <button type="button" value="two">
          Two
        </button>
        <button type="button" value="three">
          Three
        </button>
      </ToggleGroup>
    );

    wrapper = shallow(group);
  });

  it('renders with correct button active', function () {
    expect(wrapper.find(ToggleButton)).toHaveLength(3);
    expect(wrapper.find(ToggleButton).at(0).props().active).toBe(true);
    expect(wrapper.find(ToggleButton).at(1).props().active).toBe(false);
    expect(wrapper.find(ToggleButton).at(2).props().active).toBe(false);
  });

  it('calls the onChange handler with the new value when an inactive button is clicked', function () {
    expect(onChange).toHaveBeenCalledTimes(0);

    wrapper.find(ToggleButton).last().simulate('click');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]).toHaveBeenCalledWith('three');
  });

  it('does not call the onChange handler when the active button is clicked', function () {
    expect(onChange).toHaveBeenCalledTimes(0);

    wrapper.find(ToggleButton).first().simulate('click');

    expect(onChange).toHaveBeenCalledTimes(0);
  });
});
