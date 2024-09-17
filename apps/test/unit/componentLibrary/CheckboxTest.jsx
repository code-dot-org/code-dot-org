import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Checkbox from '@cdo/apps/componentLibrary/checkbox';

describe('Design System - Checkbox', () => {
  it('Checkbox - renders with correct label', () => {
    render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
      />
    );

    const checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).toBeDefined();
    expect(screen.getByText('Checkbox label')).toBeDefined();
  });

  it('Checkbox - changes checked state on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
      />
    );

    let checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).toBeDefined();

    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.indeterminate).toBe(false);

    await user.click(checkbox);

    // Re-render after user's first click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(true);
    expect(checkbox.checked).toBe(true);
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.indeterminate).toBe(false);

    await user.click(checkbox);

    // Re-render after user's second click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith(false);
    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.indeterminate).toBe(false);
  });

  it('Checkbox - renders indeterminate checkbox, changes on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    let indeterminate = true;
    const onChange = () => {
      if (indeterminate) {
        // Default browser behavior for clicking an indeterminate checkbox.
        indeterminate = false;
        checked = true;
      } else {
        checked = !checked;
      }
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    );

    let checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).toBeDefined();

    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.indeterminate).toBe(true);

    await user.click(checkbox);

    // Re-render after user's first click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(true);
    expect(checkbox.checked).toBe(true);
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.indeterminate).toBe(false);

    await user.click(checkbox);

    // Re-render after user's second click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        indeterminate={indeterminate}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(spyOnChange).toHaveBeenCalledWith(false);
    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(false);
    expect(checkbox.indeterminate).toBe(false);
  });

  it("Checkbox - renders disabled checkbox, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    let checkbox = screen.getByDisplayValue('test-checkbox');
    expect(checkbox).toBeDefined();

    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.indeterminate).toBe(false);

    await user.click(checkbox);

    // Re-render after user's first click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    checkbox = screen.getByDisplayValue('test-checkbox');

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.indeterminate).toBe(false);

    await user.click(checkbox);

    // Re-render after user's second click
    rerender(
      <Checkbox
        name="test-checkbox"
        value="test-checkbox"
        label="Checkbox label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(true);
    expect(checkbox.indeterminate).toBe(false);
  });
});
