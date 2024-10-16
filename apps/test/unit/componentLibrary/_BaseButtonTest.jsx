import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Button from '@cdo/apps/componentLibrary/button/_baseButton/_BaseButton';

describe('Design System - Button', () => {
  it('Button - renders with correct text', () => {
    render(<Button text="Button test" onClick={() => null} />);

    const button = screen.getByText('Button test');
    expect(button).toBeDefined();
  });

  it('Button - can be clicked', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    const onClick = () => {
      spyOnChange();
    };

    const ButtonToRender = () => (
      <Button text="Button" ariaLabel="ButtonLabel" onClick={onClick} />
    );

    // Initial render
    const {rerender} = render(<ButtonToRender />);

    let button = screen.getByLabelText('ButtonLabel');
    expect(button).toBeDefined();

    expect(button.disabled).toBe(false);

    await user.click(button);

    // Re-render after user's first click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('ButtonLabel');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(false);

    await user.click(button);

    // Re-render after user's second click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('ButtonLabel');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(button.disabled).toBe(false);
  });

  it("Button - renders disabled button, can't click it", async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();

    const onClick = () => {
      spyOnClick();
    };

    const ButtonToRender = () => (
      <Button
        text="Button test"
        onClick={onClick}
        ariaLabel="Button aria label"
        disabled={true}
      />
    );

    // Initial render
    const {rerender} = render(<ButtonToRender />);

    let button = screen.getByLabelText('Button aria label');
    expect(button).toBeDefined();

    await user.click(button);

    // Re-render after user's first click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('Button aria label');

    expect(spyOnClick).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);

    await user.click(button);

    // Re-render after user's second click
    rerender(<ButtonToRender />);

    button = screen.getByLabelText('Button aria label');

    expect(spyOnClick).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);
  });
});
