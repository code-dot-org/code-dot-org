import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React, {ChangeEvent, useState} from 'react';

import Checkbox from '@/checkbox';

describe('Design System - Checkbox', () => {
  const setupCheckbox = (
    initialChecked: boolean,
    props: Partial<React.ComponentProps<typeof Checkbox>> = {},
  ) => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();
    const Wrapper = () => {
      const [checked, setChecked] = useState(initialChecked);
      const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        spyOnChange(event.target.checked);
      };
      return (
        <Checkbox
          name="test-checkbox"
          value="test-value"
          label="Checkbox label"
          checked={checked}
          onChange={handleChange}
          {...props}
        />
      );
    };
    render(<Wrapper />);
    return {user, spyOnChange};
  };

  const getCheckbox = () => screen.getByRole('checkbox') as HTMLInputElement;

  it('renders with correct label', () => {
    render(
      <Checkbox
        name="test-checkbox"
        value="test-value"
        label="Checkbox label"
        checked={false}
        onChange={() => null}
      />,
    );
    const checkbox = getCheckbox();
    expect(checkbox).toBeInTheDocument();
    expect(screen.getByText('Checkbox label')).toBeInTheDocument();
  });

  it('renders without a label', () => {
    render(
      <Checkbox
        name="test-checkbox"
        value="test-value"
        checked={false}
        onChange={() => null}
      />,
    );
    expect(getCheckbox()).toBeInTheDocument();
    expect(screen.queryByText('Checkbox label')).not.toBeInTheDocument();
  });

  it('changes checked state on click', async () => {
    const {user, spyOnChange} = setupCheckbox(false);

    const checkbox = getCheckbox();
    expect(checkbox.checked).toBe(false);

    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(true);

    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith(false);
  });

  it('handles indeterminate state correctly', async () => {
    const {user, spyOnChange} = setupCheckbox(false, {indeterminate: true});

    const checkbox = getCheckbox();
    expect(checkbox.indeterminate).toBe(true);
    expect(checkbox.checked).toBe(false);

    await user.click(checkbox);
    expect(checkbox.checked).toBe(true);
    expect(checkbox.indeterminate).toBe(false);
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(true);
  });

  it('handles value prop correctly', async () => {
    const {user, spyOnChange} = setupCheckbox(false);

    const checkbox = getCheckbox();
    expect(checkbox.checked).toBe(false);

    await user.click(checkbox);

    expect(spyOnChange).toHaveBeenCalledWith(true);
    expect(checkbox).toHaveAttribute('value', 'test-value');
    expect(checkbox.checked).toBe(true);
  });

  it('does not change state when disabled', async () => {
    const {user, spyOnChange} = setupCheckbox(false, {disabled: true});

    const checkbox = getCheckbox();
    expect(checkbox.disabled).toBe(true);

    await user.click(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(spyOnChange).not.toHaveBeenCalled();
  });
});
