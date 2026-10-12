import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';

import CheckboxDropdown, {CheckboxDropdownProps} from './../index';

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
        isChecked ? [...prev, value] : prev.filter(v => v !== value),
      );
    };

    const handleSelectAll = () => {
      setSelectedValues(allOptions.map(option => option.value));
    };

    const handleClearAll = () => {
      setSelectedValues([]);
    };

    if (!props.hideControls) {
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
          selectAllText="Select all"
          clearAllText="Clear all"
          doneText="Done"
          labelText="Dropdown label"
          {...props}
        />
      );
    } else {
      return (
        <CheckboxDropdown
          name="test-dropdown"
          hideControls
          allOptions={allOptions}
          checkedOptions={selectedValues}
          onChange={e =>
            onCheckboxDropdownChange(e.target.value, e.target.checked)
          }
          labelText="Dropdown label"
          {...props}
        />
      );
    }
  };

  it('renders with correct text and options', () => {
    render(<TestCheckboxDropdown />);

    expect(screen.getByText('Dropdown label')).toBeInTheDocument();
    allOptions.forEach(option =>
      expect(screen.getByText(option.label)).toBeInTheDocument(),
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

  it('toggles between Select all and Clear all and counts selections on Done', async () => {
    const user = userEvent.setup();
    render(<TestCheckboxDropdown />);

    await user.click(
      screen.getByRole('button', {name: /test-dropdown filter dropdown/i}),
    );

    const option1 = screen.getByLabelText('option1') as HTMLInputElement;
    const option2 = screen.getByLabelText('option2') as HTMLInputElement;
    const option3 = screen.getByLabelText('option3') as HTMLInputElement;

    expect(
      screen.getByRole('button', {name: 'Select all'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: 'Clear all'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Done'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Select all'}));

    expect(option1.checked).toBe(true);
    expect(option2.checked).toBe(true);
    expect(option3.checked).toBe(true);
    expect(screen.getByRole('button', {name: 'Clear all'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Done (3)'})).toBeInTheDocument();

    await user.click(option1);

    expect(option1.checked).toBe(false);
    expect(screen.getByRole('button', {name: 'Done (2)'})).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Clear all'}));

    expect(option1.checked).toBe(false);
    expect(option2.checked).toBe(false);
    expect(option3.checked).toBe(false);
    expect(
      screen.getByRole('button', {name: 'Select all'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Done'})).toBeInTheDocument();
  });

  it('closes the menu from Done and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<TestCheckboxDropdown />);

    const trigger = screen.getByRole('button', {
      name: /test-dropdown filter dropdown/i,
    });
    await user.click(trigger);
    expect(trigger.parentElement).toHaveClass('open');

    await user.click(screen.getByLabelText('option1'));
    await user.click(screen.getByRole('button', {name: 'Done (1)'}));

    expect(trigger.parentElement).not.toHaveClass('open');
    expect(trigger).toHaveFocus();
  });

  it('renders with no action row when controls are hidden', () => {
    render(<TestCheckboxDropdown hideControls />);

    expect(screen.getByText('Dropdown label')).toBeDefined();
    expect(screen.getByDisplayValue('option-1')).toBeDefined();
    expect(
      screen.queryByRole('button', {name: 'Select all', hidden: true}),
    ).toBeNull();
    expect(
      screen.queryByRole('button', {name: 'Clear all', hidden: true}),
    ).toBeNull();
    expect(
      screen.queryByRole('button', {name: 'Done', hidden: true}),
    ).toBeNull();
  });
});
