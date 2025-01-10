import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import _BaseButton from '@cdo/apps/componentLibrary/button/_baseButton/_BaseButton';

describe('Design System - Button', () => {
  it('renders with correct text', () => {
    render(<_BaseButton text="Button test" onClick={() => null} />);

    const button = screen.getByText('Button test');
    expect(button).toBeInTheDocument();
  });

  it('can be clicked', async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();

    render(
      <_BaseButton text="Button" ariaLabel="ButtonLabel" onClick={spyOnClick} />
    );

    const button = screen.getByLabelText('ButtonLabel');
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();

    await user.click(button);

    expect(spyOnClick).toHaveBeenCalledTimes(1);

    await user.click(button);

    expect(spyOnClick).toHaveBeenCalledTimes(2);
  });

  it("renders disabled button and doesn't trigger clicks", async () => {
    const user = userEvent.setup();
    const spyOnClick = jest.fn();

    render(
      <_BaseButton
        text="Button test"
        ariaLabel="Button aria label"
        onClick={spyOnClick}
        disabled
      />
    );

    const button = screen.getByLabelText('Button aria label');
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    await user.click(button);

    expect(spyOnClick).not.toHaveBeenCalled();
  });
});
