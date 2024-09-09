import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';

let dropdownValue;
let onDropdownChange = value => (dropdownValue = value);

describe('Design System - Dropdown Select Component', () => {
  beforeEach(() => {
    onDropdownChange('');
  });

  it('SimpleDropdown - renders with correct text and options', () => {
    render(
      <SimpleDropdown
        name="test1-dropdown"
        items={[
          {value: 'option-1', text: 'option1'},
          {value: 'option-2', text: 'option2'},
          {value: 'option-3', text: 'option3'},
        ]}
        selectedValue={dropdownValue}
        onChange={e => onDropdownChange(e.target.value)}
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

  it('SimpleDropdown - renders with correct text and options, changes selected value on when one is selected', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const onChange = e => {
      onDropdownChange(e.target.value);
      spyOnChange(e.target.value);
    };
    const DropdownToRender = () => (
      <SimpleDropdown
        name="test2-dropdown"
        items={[
          {value: 'option-1', text: 'option1'},
          {value: 'option-2', text: 'option2'},
          {value: 'option-3', text: 'option3'},
        ]}
        selectedValue={dropdownValue}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const selectElement = screen.getByRole('combobox');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).toBeDefined();
    expect(selectElement).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(dropdownValue).toBe('');

    await user.selectOptions(selectElement, 'option-1');

    rerender(<DropdownToRender />);

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith('option-1');
    expect(dropdownValue).toBe('option-1');

    await user.selectOptions(selectElement, 'option-2');

    rerender(<DropdownToRender />);

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith('option-2');
    expect(dropdownValue).toBe('option-2');
  });

  it("SimpleDropdown - renders disabled dropdown, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const onChange = e => {
      onDropdownChange(e.target.value);
      spyOnChange(e.target.value);
    };

    const DropdownToRender = () => (
      <SimpleDropdown
        name="test2-dropdown"
        disabled={true}
        items={[
          {value: 'option-1', text: 'option1'},
          {value: 'option-2', text: 'option2'},
          {value: 'option-3', text: 'option3'},
        ]}
        selectedValue={dropdownValue}
        onChange={onChange}
        labelText="Dropdown2 label"
      />
    );

    const {rerender} = render(<DropdownToRender />);

    const label = screen.getByText('Dropdown2 label');
    const selectElement = screen.getByRole('combobox');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(label).toBeDefined();
    expect(selectElement).toBeDefined();
    expect(option1).toBeDefined();
    expect(option2).toBeDefined();
    expect(dropdownValue).toBe('');

    await user.selectOptions(selectElement, 'option-1');

    rerender(<DropdownToRender />);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(dropdownValue).toBe('');

    await user.selectOptions(selectElement, 'option-2');

    rerender(<DropdownToRender />);

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(dropdownValue).toBe('');
  });

  it('SimpleDropdown - renders with correct text and options with grouped items', () => {
    render(
      <SimpleDropdown
        name="test4-dropdown"
        itemGroups={[
          {
            label: 'Group1',
            groupItems: [
              {value: 'option-1', text: 'option1'},
              {value: 'option-2', text: 'option2'},
            ],
          },
          {
            label: 'Group2',
            groupItems: [{value: 'option-3', text: 'option3'}],
          },
        ]}
        selectedValue={dropdownValue}
        onChange={e => onDropdownChange(e.target.value)}
        labelText="Dropdown label"
      />
    );

    const label = screen.getByText('Dropdown label');
    const groupLabels = screen.getAllByRole('group');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');
    const option3 = screen.getByText('option3');

    expect(label).toBeDefined();
    expect(option1).toBeDefined();
    expect(groupLabels).toHaveLength(2);
    expect(option2).toBeDefined();
    expect(option3).toBeDefined();
  });

  it('SimpleDropdown - renders a spinner if loading is true', () => {
    render(
      <SimpleDropdown
        loading={true}
        labelText="Test Dropdown"
        onChange={() => {}}
        name="spinner-test-dropdown"
      />
    );

    // Check if the spinner is in the document
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });
});
