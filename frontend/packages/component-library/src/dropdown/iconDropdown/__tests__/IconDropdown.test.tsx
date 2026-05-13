import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import '@testing-library/jest-dom';

import IconDropdown, {IconDropdownProps, IconDropdownOption} from './../index';

const allOptions: IconDropdownOption[] = [
  {
    value: 'option-1',
    label: 'option1',
    icon: {iconName: 'check', iconStyle: 'solid', title: 'Option 1 Icon'},
  },
  {
    value: 'option-2',
    label: 'option2',
    icon: {iconName: 'check', iconStyle: 'solid', title: 'Option 2 Icon'},
  },
  {
    value: 'option-3',
    label: 'option3',
    icon: {iconName: 'check', iconStyle: 'solid', title: 'Option 3 Icon'},
  },
];

describe('Design System - Icon Dropdown Component', () => {
  const TestIconDropdown: React.FC<Partial<IconDropdownProps>> = props => {
    const [selectedOption, setSelectedOption] = useState<IconDropdownOption>(
      props.selectedOption || ({} as IconDropdownOption),
    );

    const handleChange = (option: IconDropdownOption) => {
      setSelectedOption(option);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      props && props.onChange && props.onChange(option);
    };

    return (
      <IconDropdown
        name="test-dropdown"
        options={allOptions}
        selectedOption={selectedOption}
        onChange={handleChange}
        {...props}
        labelText={props.labelText || 'Icon Dropdown Component'}
      />
    );
  };

  it('renders with correct label and options', () => {
    render(<TestIconDropdown labelText="Dropdown label" />);

    const label = screen.getByText('Dropdown label');
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');
    const option3 = screen.getByText('option3');

    expect(label).toBeInTheDocument();
    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
    expect(option3).toBeInTheDocument();
  });

  it('changes selected value when an option is selected', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    render(
      <TestIconDropdown labelText="Dropdown2 label" onChange={spyOnChange} />,
    );

    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();

    // Select the first option
    await user.click(option1);

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(allOptions[0]);

    // Select the second option
    await user.click(option2);

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith(allOptions[1]);
  });

  it("doesn't change value when dropdown is disabled", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    render(
      <TestIconDropdown
        labelText="Dropdown2 label"
        disabled={true}
        onChange={spyOnChange}
      />,
    );

    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();

    // Try clicking the options
    await user.click(option1);
    await user.click(option2);

    expect(spyOnChange).not.toHaveBeenCalled();
  });

  it('renders the correct icons for options', () => {
    render(<TestIconDropdown labelText="Dropdown with icons" />);

    const icon1 = screen.getByTitle('Option 1 Icon');
    const icon2 = screen.getByTitle('Option 2 Icon');
    const icon3 = screen.getByTitle('Option 3 Icon');

    expect(icon1).toBeInTheDocument();
    expect(icon2).toBeInTheDocument();
    expect(icon3).toBeInTheDocument();
  });
});
