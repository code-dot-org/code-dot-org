import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {ActionDropdown} from '@cdo/apps/componentLibrary/dropdown';

const allOptions = [
  {
    value: 'option-1',
    label: 'option1',
    icon: {iconName: 'check', iconStyle: 'solid'},
    onClick: jest.fn(),
  },
  {
    value: 'option-2',
    label: 'option2',
    icon: {iconName: 'check', iconStyle: 'solid'},
    onClick: jest.fn(),
  },
  {
    value: 'option-3',
    label: 'option3',
    icon: {iconName: 'check', iconStyle: 'solid'},
    onClick: jest.fn(),
  },
];

const triggerButtonProps = {
  isIconOnly: true,
  icon: {iconName: 'check', iconStyle: 'solid'},
};

describe('Design System - Action Dropdown Component', () => {
  beforeEach(() => {
    allOptions.forEach(option => option.onClick.mockClear());
  });

  it('Action Dropdown - renders with correct text and options', () => {
    render(
      <ActionDropdown
        name="test1-dropdown"
        options={allOptions}
        labelText="Dropdown label"
        triggerButtonProps={triggerButtonProps}
      />
    );

    const triggerButton = screen.getByRole('button', {name: 'Dropdown label'});
    const option1 = screen.getByText('option1');
    const option2 = screen.getByText('option2');
    const option3 = screen.getByText('option3');

    expect(triggerButton).toBeTruthy();
    expect(option1).toBeTruthy();
    expect(option2).toBeTruthy();
    expect(option3).toBeTruthy();
  });

  it('Action Dropdown - calls onClick when an option is selected', async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdown
        name="test2-dropdown"
        options={allOptions}
        labelText="Dropdown2 label"
        triggerButtonProps={triggerButtonProps}
      />
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

  it("Action Dropdown - renders disabled dropdown, doesn't call onClick on click", async () => {
    const user = userEvent.setup();
    render(
      <ActionDropdown
        name="test2-dropdown"
        disabled={true}
        options={allOptions}
        labelText="Dropdown2 label"
        triggerButtonProps={triggerButtonProps}
      />
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

  it('Action Dropdown - renders trigger button with custom props', () => {
    render(
      <ActionDropdown
        name="test3-dropdown"
        options={allOptions}
        labelText="Dropdown3 label"
        triggerButtonProps={{
          ...triggerButtonProps,
          className: 'custom-trigger-button',
        }}
      />
    );

    const triggerButton = screen.getByRole('button', {name: 'Dropdown3 label'});
    expect(triggerButton.classList.contains('custom-trigger-button')).toBe(
      true
    );
  });
});
