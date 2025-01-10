import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, {useState, ChangeEvent} from 'react';
import '@testing-library/jest-dom';

import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';

describe('Design System - Dropdown Select Component', () => {
  const renderDropdown = (
    props: Partial<React.ComponentProps<typeof SimpleDropdown>>
  ) => {
    const Wrapper: React.FC = () => {
      const [dropdownValue, setDropdownValue] = useState<string>(
        props.selectedValue || ''
      );

      const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setDropdownValue(e.target.value);
        props.onChange?.(e);
      };

      return (
        <SimpleDropdown
          {...props}
          name={props.name || 'test-dropdown'}
          labelText={props.labelText || 'Dropdown label'}
          selectedValue={dropdownValue}
          onChange={handleChange}
        />
      );
    };

    return render(<Wrapper />);
  };

  it('renders with correct text and options', () => {
    renderDropdown({
      name: 'test1-dropdown',
      items: [
        {value: 'option-1', text: 'option1'},
        {value: 'option-2', text: 'option2'},
        {value: 'option-3', text: 'option3'},
      ],
      labelText: 'Dropdown label',
    });

    expect(screen.getByText('Dropdown label')).toBeInTheDocument();
    expect(screen.getByText('option1')).toBeInTheDocument();
    expect(screen.getByText('option2')).toBeInTheDocument();
    expect(screen.getByText('option3')).toBeInTheDocument();
  });

  it('renders a helper message', () => {
    renderDropdown({
      name: 'test-dropdown',
      items: [
        {value: 'option-1', text: 'option1'},
        {value: 'option-2', text: 'option2'},
        {value: 'option-3', text: 'option3'},
      ],
      labelText: 'Dropdown label',
      helperMessage: 'Helper message',
    });

    expect(screen.getByText(/helper message/i)).toBeInTheDocument();
  });

  it('renders an error message', () => {
    renderDropdown({
      name: 'test-dropdown',
      items: [
        {value: 'option-1', text: 'option1'},
        {value: 'option-2', text: 'option2'},
        {value: 'option-3', text: 'option3'},
      ],
      labelText: 'Dropdown label',
      errorMessage: 'Error message',
    });

    expect(screen.getByText(/error message/i)).toBeInTheDocument();
  });

  it('renders an error message instead of a helper message if both are passed', () => {
    renderDropdown({
      name: 'test-dropdown',
      items: [
        {value: 'option-1', text: 'option1'},
        {value: 'option-2', text: 'option2'},
        {value: 'option-3', text: 'option3'},
      ],
      labelText: 'Dropdown label',
      errorMessage: 'Error message',
      helperMessage: 'Helper message',
    });

    expect(screen.getByText(/error message/i)).toBeInTheDocument();
    expect(screen.queryByText(/helper message/i)).toBeNull();
  });

  it('changes selected value when one is selected', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderDropdown({
      name: 'test2-dropdown',
      items: [
        {value: 'option-1', text: 'option1'},
        {value: 'option-2', text: 'option2'},
        {value: 'option-3', text: 'option3'},
      ],
      labelText: 'Dropdown2 label',
      onChange: spyOnChange,
    });

    const selectElement = screen.getByRole('combobox');

    // though the select element is empty, the selected value is set to the first option
    expect(selectElement).toHaveValue('option-1');

    // Simulate selecting an option
    await user.selectOptions(selectElement, 'option-1');

    // Validate that the correct value is set
    expect(selectElement).toHaveValue('option-1');

    // Validate that the event handler is called with the correct value
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({value: 'option-1'}),
      })
    );

    // Simulate selecting another option
    await user.selectOptions(selectElement, 'option-2');

    // Validate the updated value
    expect(selectElement).toHaveValue('option-2');

    // Validate the event handler is called with the updated value
    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({value: 'option-2'}),
      })
    );
  });

  it("doesn't change value when disabled", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    renderDropdown({
      name: 'test2-dropdown',
      disabled: true,
      items: [
        {value: 'option-1', text: 'option1'},
        {value: 'option-2', text: 'option2'},
        {value: 'option-3', text: 'option3'},
      ],
      labelText: 'Dropdown2 label',
      onChange: spyOnChange,
    });

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeDisabled();

    await user.selectOptions(selectElement, 'option-2');
    expect(spyOnChange).not.toHaveBeenCalled();
    // Though user passes no value to SimpleDropdown, the selected value is set to the first option by default
    expect(selectElement).toHaveValue('option-1');
  });

  it('renders grouped items with correct structure', () => {
    renderDropdown({
      name: 'test4-dropdown',
      itemGroups: [
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
      ],
      labelText: 'Dropdown label',
    });

    expect(screen.getByText('Dropdown label')).toBeInTheDocument();
    expect(screen.getAllByRole('group')).toHaveLength(2);
    expect(screen.getByText('option1')).toBeInTheDocument();
    expect(screen.getByText('option2')).toBeInTheDocument();
    expect(screen.getByText('option3')).toBeInTheDocument();
  });
});
