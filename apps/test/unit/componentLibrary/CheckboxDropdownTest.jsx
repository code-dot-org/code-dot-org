import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {CheckboxDropdown} from '@cdo/apps/componentLibrary/dropdown';

const allOptions = [
  {value: 'option-1', label: 'option1'},
  {value: 'option-2', label: 'option2'},
  {value: 'option-3', label: 'option3'},
];
let selectedValues = [];
const onCheckboxDropdownChange = (value, isChecked) => {
  if (isChecked) {
    selectedValues.push(value);
  } else {
    selectedValues = selectedValues.filter(v => v !== value);
  }
};
const handleSelectAll = () => {
  selectedValues = allOptions.map(option => option.value);
};
const handleClearAll = () => (selectedValues = []);

describe('Design System - Checkbox Dropdown Component', () => {
  beforeEach(() => {
    handleClearAll();
  });

  it('Checkbox Dropdown - renders with correct text and options', () => {
    render(
      <CheckboxDropdown
        name="test1-dropdown"
        allOptions={allOptions}
        checkedOptions={selectedValues}
        onChange={e =>
          onCheckboxDropdownChange(e.target.value, e.target.checked)
        }
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
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

  it('Checkbox Dropdown - renders with correct text and options, changes selected value on when one is selected', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const onChange = e => {
      onCheckboxDropdownChange(e.target.value, e.target.checked);
      spyOnChange(e.target.value, e.target.checked);
    };
    const DropdownToRender = () => (
      <CheckboxDropdown
        name="test2-dropdown"
        allOptions={allOptions}
        checkedOptions={selectedValues}
        onChange={onChange}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const option1 = screen.getByDisplayValue('option-1');
    const option2 = screen.getByDisplayValue('option-2');

    expect(label).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(selectedValues.length).toBe(0);

    await user.click(option1);

    rerender(<DropdownToRender />);

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(selectedValues[0]).toBe('option-1');
    expect(selectedValues.length).toBe(1);

    await user.click(option2);

    rerender(<DropdownToRender />);

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(selectedValues[1]).toBe('option-2');
    expect(selectedValues.length).toBe(2);
  });

  it("Checkbox Dropdown - renders disabled dropdown, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const onChange = e => {
      onCheckboxDropdownChange(e.target.value, e.target.checked);
      spyOnChange(e.target.value, e.target.checked);
    };

    const DropdownToRender = () => (
      <CheckboxDropdown
        name="test2-dropdown"
        disabled={true}
        allOptions={allOptions}
        checkedOptions={selectedValues}
        onChange={onChange}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const option1 = screen.getByDisplayValue('option-1');
    const option2 = screen.getByDisplayValue('option-2');

    expect(label).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(selectedValues.length).toBe(0);

    await user.click(option1);

    rerender(<DropdownToRender />);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(selectedValues.length).toBe(0);

    await user.click(option2);

    rerender(<DropdownToRender />);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(selectedValues.length).toBe(0);
    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);
  });

  it('Checkbox Dropdown - handles Select all and Clear all clicks', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const onChange = e => {
      onCheckboxDropdownChange(e.target.value, e.target.checked);
      spyOnChange(e.target.value, e.target.checked);
    };

    const DropdownToRender = () => (
      <CheckboxDropdown
        name="test2-dropdown"
        disabled={true}
        allOptions={allOptions}
        checkedOptions={selectedValues}
        onChange={onChange}
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const option1 = screen.getByDisplayValue('option-1');
    const option2 = screen.getByDisplayValue('option-2');
    const option3 = screen.getByDisplayValue('option-3');
    const selectAll = screen.getByText('Select all');
    const clearAll = screen.getByText('Clear all');

    expect(label).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(option3).toBeDefined();
    expect(selectAll).toBeDefined();
    expect(clearAll).toBeDefined();

    await user.click(selectAll);

    rerender(<DropdownToRender />);
    expect(selectedValues.length).toBe(3);
    expect(option1.checked).toBe(true);
    expect(option2.checked).toBe(true);
    expect(option3.checked).toBe(true);

    await user.click(clearAll);

    rerender(<DropdownToRender />);
    expect(selectedValues.length).toBe(0);
    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);
    expect(option3.checked).toBe(false);
  });
});
