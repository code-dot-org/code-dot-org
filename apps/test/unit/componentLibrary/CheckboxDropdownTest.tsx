import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, {useState} from 'react';
import '@testing-library/jest-dom';

import {
  CheckboxDropdown,
  CheckboxDropdownProps,
} from '@cdo/apps/componentLibrary/dropdown';

const allOptions = [
  {value: 'option-1', label: 'option1'},
  {value: 'option-2', label: 'option2'},
  {value: 'option-3', label: 'option3'},
];

describe('Design System - Checkbox Dropdown Component', () => {
  const TestCheckboxDropdown: React.FC<
    Partial<CheckboxDropdownProps>
  > = props => {
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    const onCheckboxDropdownChange = (value: string, isChecked: boolean) => {
      setSelectedValues(prev =>
        isChecked ? [...prev, value] : prev.filter(v => v !== value)
      );
    };

    const handleSelectAll = () => {
      setSelectedValues(allOptions.map(option => option.value));
    };

    const handleClearAll = () => {
      setSelectedValues([]);
    };

    return (
      <CheckboxDropdown
        name="test-dropdown"
        allOptions={allOptions}
        checkedOptions={selectedValues}
        onChange={e =>
          onCheckboxDropdownChange(e.target.value, e.target.checked)
        }
        onSelectAll={handleSelectAll}
        onClearAll={handleClearAll}
        labelText="Dropdown label"
        {...props}
      />
    );
  };

  it('renders with correct text and options', () => {
    render(<TestCheckboxDropdown />);

    expect(screen.getByText('Dropdown label')).toBeInTheDocument();
    allOptions.forEach(option =>
      expect(screen.getByText(option.label)).toBeInTheDocument()
    );
  });

  it('changes selected value when an option is selected', async () => {
    const user = userEvent.setup();
    render(<TestCheckboxDropdown />);

    const option1 = screen.getByLabelText('option1') as HTMLInputElement;
    const option2 = screen.getByLabelText('option2') as HTMLInputElement;

    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);

    await user.click(option1);

    expect(option1.checked).toBe(true);
    expect(option2.checked).toBe(false);

    await user.click(option2);

    expect(option1.checked).toBe(true);
    expect(option2.checked).toBe(true);
  });

  it("doesn't change selected value when disabled", async () => {
    const user = userEvent.setup();
    render(<TestCheckboxDropdown disabled />);

    const option1 = screen.getByLabelText('option1') as HTMLInputElement;
    const option2 = screen.getByLabelText('option2') as HTMLInputElement;

    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);

    await user.click(option1);

    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);
  });

  it('handles Select All and Clear All actions', async () => {
    const user = userEvent.setup();
    render(<TestCheckboxDropdown />);

    const option1 = screen.getByLabelText('option1') as HTMLInputElement;
    const option2 = screen.getByLabelText('option2') as HTMLInputElement;
    const option3 = screen.getByLabelText('option3') as HTMLInputElement;

    const selectAll = screen.getByText('Select all');
    const clearAll = screen.getByText('Clear all');

    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);
    expect(option3.checked).toBe(false);

    await user.click(selectAll);

    expect(option1.checked).toBe(true);
    expect(option2.checked).toBe(true);
    expect(option3.checked).toBe(true);

    await user.click(clearAll);

    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);
    expect(option3.checked).toBe(false);
  });
});
