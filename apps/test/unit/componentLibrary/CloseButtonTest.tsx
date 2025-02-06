import CloseButton from '@code-dot-org/component-library/closeButton';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

describe('Design System - CloseButton', () => {
  it('renders with default props', () => {
    render(<CloseButton onClick={() => {}} aria-label="default close" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'default close');
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
    // TODO [Design2-197] - Create a visual test for this case instead of checking for class name
    // eslint-disable-next-line no-restricted-properties
    expect(button).toHaveClass(className);
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
