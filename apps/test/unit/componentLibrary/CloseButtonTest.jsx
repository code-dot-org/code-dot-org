import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import CloseButton from '@cdo/apps/componentLibrary/closeButton';

describe('Design System - CloseButton', () => {
  it('renders with default props', () => {
    render(<CloseButton onClick={() => {}} aria-label="default close" />);

    const button = screen.getByRole('button');
    expect(button).toBeDefined();
  });

  it('applies custom class name', () => {
    const className = 'custom-class';
    render(
      <CloseButton
        aria-label="custom className close"
        onClick={() => {}}
        className={className}
      />
    );

    const button = screen.getByRole('button');
    expect(button.classList.contains(className)).toBe(true);
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();

    render(
      <CloseButton aria-label="Close to test onClick" onClick={handleClick} />
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
