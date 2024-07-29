import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Toggle from '@cdo/apps/componentLibrary/toggle';

describe('Design System - Toggle', () => {
  it('Toggle - renders with correct label', () => {
    const toggleLabel = 'Toggle label';
    render(
      <Toggle name="test-toggle" value="test-toggle" label={toggleLabel} />
    );

    const toggle = screen.getByDisplayValue('test-toggle');
    expect(toggle).toBeDefined();
    expect(screen.getByText(toggleLabel)).toBeDefined();
  });

  it('Toggle - changes checked state on click', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
      />
    );

    let toggle = screen.getByDisplayValue('test-toggle');

    expect(toggle).toBeDefined();
    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(false);

    await user.click(toggle);

    // Re-render after user's first click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(true);
    expect(toggle.checked).toBe(true);
    expect(toggle.disabled).toBe(false);

    await user.click(toggle);

    // Re-render after user's second click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(false);
  });

  it("Toggle - renders disabled toggle, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    let toggle = screen.getByDisplayValue('test-toggle');
    expect(toggle).toBeDefined();

    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(true);

    await user.click(toggle);

    // Re-render after user's first click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');

    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(true);

    await user.click(toggle);

    // Re-render after user's second click
    rerender(
      <Toggle
        name="test-toggle"
        value="test-toggle"
        label="Toggle label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    toggle = screen.getByDisplayValue('test-toggle');
    expect(toggle.checked).toBe(false);
    expect(toggle.disabled).toBe(true);
  });
});
