import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import RadioButton from '@cdo/apps/componentLibrary/radioButton';

describe('Design System - Radio Button', () => {
  it('RadioButton - renders with correct label', () => {
    const radioButtonLabel = 'Radio Button label';

    render(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
      />
    );

    const radioButton = screen.getByDisplayValue('test-radioButton');

    expect(radioButton).toBeDefined();
    expect(screen.getByText(radioButtonLabel)).toBeDefined();
  });

  it('RadioButton - selects button when clicked, once selected - remains selected if clicked again', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />
    );

    let radioButton = screen.getByDisplayValue('test-radioButton');

    expect(radioButton).toBeDefined();
    expect(radioButton.checked).toBe(false);
    expect(radioButton.disabled).toBe(false);

    await user.click(radioButton);

    // Re-render after user's first click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(spyOnChange).toHaveBeenCalledWith(true);
    expect(radioButton.checked).toBe(true);
    expect(radioButton.disabled).toBe(false);

    await user.click(radioButton);

    // Re-render after user's second click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    // RadioButton's onChange is only called when radioButton is not checked. Second click won't call onChange.
    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(radioButton.checked).toBe(true);
    expect(radioButton.disabled).toBe(false);
  });

  it("RadioButton - renders disabled radio button, doesn't change on click", async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    let checked = false;
    const onChange = () => {
      checked = !checked;
      spyOnChange(checked);
    };

    // Initial render
    const {rerender} = render(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    let radioButton = screen.getByDisplayValue('test-radioButton');

    expect(radioButton).toBeDefined();
    expect(radioButton.checked).toBe(false);
    expect(radioButton.disabled).toBe(true);

    await user.click(radioButton);

    // Re-render after user's first click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(radioButton.checked).toBe(false);
    expect(radioButton.disabled).toBe(true);

    await user.click(radioButton);

    // Re-render after user's second click
    rerender(
      <RadioButton
        name="test-radioButton"
        value="test-radioButton"
        label="Radio Button label"
        checked={checked}
        onChange={onChange}
        disabled={true}
      />
    );

    radioButton = screen.getByDisplayValue('test-radioButton');

    expect(spyOnChange).not.toHaveBeenCalled();
    expect(radioButton.checked).toBe(false);
    expect(radioButton.disabled).toBe(true);
  });
});
