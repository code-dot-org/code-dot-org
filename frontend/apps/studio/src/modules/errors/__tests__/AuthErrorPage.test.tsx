import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, it, expect, vi} from 'vitest';

import {AuthErrorPage} from '../AuthErrorPage';

describe('AuthErrorPage', () => {
  it('renders heading and retry button', () => {
    render(<AuthErrorPage onRetry={vi.fn()} />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: /try again/i}),
    ).toBeInTheDocument();
  });

  it('calls onRetry exactly once when button is clicked', async () => {
    const onRetry = vi.fn();
    render(<AuthErrorPage onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', {name: /try again/i}));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows event ID when provided', () => {
    render(<AuthErrorPage onRetry={vi.fn()} observabilityEventId="abc-123" />);
    expect(screen.getByText(/abc-123/)).toBeInTheDocument();
  });

  it('does not show event ID when absent', () => {
    render(<AuthErrorPage onRetry={vi.fn()} />);
    expect(screen.queryByText(/Event ID/)).not.toBeInTheDocument();
  });
});
