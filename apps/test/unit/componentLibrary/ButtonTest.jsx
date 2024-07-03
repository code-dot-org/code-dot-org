import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import _BaseButton from '@cdo/apps/componentLibrary/button/_baseButton/_BaseButton';

describe('Design System - _BaseButton', () => {
  it('_BaseButton - renders with correct text', () => {
    render(<_BaseButton text="_BaseButton test" onClick={() => null} />);

    const button = screen.getByText('_BaseButton test');
    expect(button).toBeDefined();
  });

  it('_BaseButton - can be clicked', async () => {
    const user = userEvent.setup();
    const spyOnChange = jest.fn();

    const onClick = () => {
      spyOnChange();
    };

    const _BaseButtonToRender = () => (
      <_BaseButton
        text="_BaseButton"
        ariaLabel="_BaseButtonLabel"
        onClick={onClick}
      />
    );

    // Initial render
    const {rerender} = render(<_BaseButtonToRender />);

    let button = screen.getByLabelText('_BaseButtonLabel');
    expect(button).toBeDefined();

    expect(button.disabled).toBe(false);

    await user.click(button);

    // Re-render after user's first click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButtonLabel');

    expect(spyOnChange).toHaveBeenCalledTimes(1);
    expect(button.disabled).toBe(false);

    await user.click(button);

    // Re-render after user's second click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButtonLabel');

    expect(spyOnChange).toHaveBeenCalledTimes(2);
    expect(button.disabled).toBe(false);
  });

  it("_BaseButton - renders disabled button, can't click it", async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();

    const onClick = () => {
      spyOnClick();
    };

    const _BaseButtonToRender = () => (
      <_BaseButton
        text="_BaseButton test"
        onClick={onClick}
        ariaLabel="_BaseButton aria label"
        disabled={true}
      />
    );

    // Initial render
    const {rerender} = render(<_BaseButtonToRender />);

    let button = screen.getByLabelText('_BaseButton aria label');
    expect(button).toBeDefined();

    await user.click(button);

    // Re-render after user's first click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButton aria label');

    expect(spyOnClick).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);

    await user.click(button);

    // Re-render after user's second click
    rerender(<_BaseButtonToRender />);

    button = screen.getByLabelText('_BaseButton aria label');

    expect(spyOnClick).not.toHaveBeenCalled();
    expect(button.disabled).toBe(true);
  });
});
