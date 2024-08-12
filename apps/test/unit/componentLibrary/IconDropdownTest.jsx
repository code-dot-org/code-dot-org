import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {IconDropdown} from '@cdo/apps/componentLibrary/dropdown';

const allOptions = [
  {
    value: 'option-1',
    label: 'option1',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
  {
    value: 'option-2',
    label: 'option2',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
  {
    value: 'option-3',
    label: 'option3',
    icon: {iconName: 'check', iconStyle: 'solid'},
  },
];
let selectedValue = {};
const onIconDropdownChange = option => {
  selectedValue = option;
};

describe('Design System - Icon Dropdown Component', () => {
  beforeEach(() => {
    onIconDropdownChange({});
  });

  it('Icon Dropdown - renders with correct text and options', () => {
    render(
      <IconDropdown
        name="test1-dropdown"
        options={allOptions}
        selectedOption={selectedValue}
        onChange={onIconDropdownChange}
        labelText="Dropdown label"
      />
    );

    const label = screen.getByText('Dropdown label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');
    const option3 = screen.getByText('option3');

    expect(label).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(option3).toBeDefined();
  });

  it('Icon Dropdown - renders with correct text and options, changes selected value on when one is selected', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const onChange = option => {
      onIconDropdownChange(option);
      spyOnChange(option);
    };
    const DropdownToRender = () => (
      <IconDropdown
        name="test2-dropdown"
        options={allOptions}
        selectedOption={selectedValue}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(selectedValue.value).toBeUndefined();

    await user.click(option1);

    rerender(<DropdownToRender />);

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(selectedValue.value).toBe('option-1');

    await user.click(option2);

    rerender(<DropdownToRender />);

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(selectedValue.value).toBe('option-2');
  });

  it("Icon Dropdown - renders disabled dropdown, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const onChange = option => {
      onIconDropdownChange(option);
      spyOnChange(option);
    };

    const DropdownToRender = () => (
      <IconDropdown
        name="test2-dropdown"
        disabled={true}
        options={allOptions}
        selectedOption={selectedValue}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(selectedValue.value).toBeUndefined();

    await user.click(option1);

    rerender(<DropdownToRender />);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(selectedValue.value).toBeUndefined();

    await user.click(option2);

    rerender(<DropdownToRender />);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(selectedValue.value).toBeUndefined();
  });
});
