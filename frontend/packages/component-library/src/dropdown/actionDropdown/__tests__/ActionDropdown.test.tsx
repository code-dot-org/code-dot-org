import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ActionDropdown, {ActionDropdownOption} from './../index';

const allOptions: ActionDropdownOption[] = [
  {
    value: 'option-1',
    label: 'option1',
    icon: {iconName: 'check', iconStyle: 'solid', title: 'Option 1 Icon'},
    onClick: jest.fn(),
  },
  {
    value: 'option-2',
    label: 'option2',
    icon: {iconName: 'check', iconStyle: 'solid', title: 'Option 2 Icon'},
    onClick: jest.fn(),
  },
  {
    value: 'option-3',
    label: 'option3',
    icon: {iconName: 'check', iconStyle: 'solid', title: 'Option 3 Icon'},
    onClick: jest.fn(),
  },
];

const triggerButtonProps = {
  isIconOnly: true,
  icon: {
    iconName: 'check',
    iconStyle: 'solid' as const,
    title: 'Trigger Icon',
  },
};

describe('Design System - Action Dropdown Component', () => {
  beforeEach(() => {
    allOptions.forEach(option => (option.onClick as jest.Mock).mockClear());
  });

  it('renders with correct label and options', () => {
    render(
      <ActionDropdown
        name="test1-dropdown"
        options={allOptions}
        labelText="Dropdown label"
        triggerButtonProps={triggerButtonProps}
      />,
    );

    const triggerButton = screen.getByRole('button', {name: 'Dropdown label'});
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');
    const option3 = screen.getByText('option3');

    expect(triggerButton).toBeInTheDocument();
    expect(option1).toBeInTheDocument();
    expect(option2).toBeInTheDocument();
    expect(option3).toBeInTheDocument();
  });

  it('calls onClick when an option is selected', async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdown
        name="test2-dropdown"
        options={allOptions}
        labelText="Dropdown2 label"
        triggerButtonProps={triggerButtonProps}
      />,
    );

    const triggerButton = screen.getByRole('button', {name: 'Dropdown2 label'});
    await user.click(triggerButton);

    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    await user.click(option1);
    expect(allOptions[0].onClick).toHaveBeenCalledTimes(1);

    await user.click(option2);
    expect(allOptions[1].onClick).toHaveBeenCalledTimes(1);
  });

  it("doesn't call onClick when dropdown is disabled", async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdown
        name="test2-dropdown"
        disabled={true}
        options={allOptions}
        labelText="Dropdown2 label"
        triggerButtonProps={triggerButtonProps}
      />,
    );

    const triggerButton = screen.getByRole('button', {name: 'Dropdown2 label'});
    await user.click(triggerButton);

    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');

    await user.click(option1);
    expect(allOptions[0].onClick).not.toHaveBeenCalled();

    await user.click(option2);
    expect(allOptions[1].onClick).not.toHaveBeenCalled();
  });

  it('renders trigger button with custom props', () => {
    render(
      <ActionDropdown
        name="test3-dropdown"
        options={allOptions}
        labelText="Dropdown3 label"
        triggerButtonProps={{
          ...triggerButtonProps,
          className: 'custom-trigger-button',
          'aria-hidden': false,
        }}
      />,
    );

    const triggerButton = screen.getByRole('button', {name: 'Dropdown3 label'});
    expect(triggerButton).toHaveAttribute('aria-hidden', 'false');
  });

  it('renders the correct icons for options', () => {
    render(
      <ActionDropdown
        name="test4-dropdown"
        options={allOptions}
        labelText="Dropdown with icons"
        triggerButtonProps={triggerButtonProps}
      />,
    );

    const icon1 = screen.getByTitle('Option 1 Icon');
    const icon2 = screen.getByTitle('Option 2 Icon');
    const icon3 = screen.getByTitle('Option 3 Icon');

    expect(icon1).toBeInTheDocument();
    expect(icon2).toBeInTheDocument();
    expect(icon3).toBeInTheDocument();
  });
});
