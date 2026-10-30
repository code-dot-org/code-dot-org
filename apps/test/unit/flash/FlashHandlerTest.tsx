import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import React from 'react';

import {FlashHandler} from '@cdo/apps/flashes/FlashHandler';

describe('FlashHandler', () => {
  it('does not render when flash is undefined', () => {
    const {container} = render(<FlashHandler />);
    expect(container.firstChild).toBeNull();
  });

  it('does not render when flash is empty', () => {
    const {container} = render(<FlashHandler flash={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('announces the first flash message via the live region', async () => {
    render(<FlashHandler flash={[['notice', 'All good']]} />);
    // The message is announced from the toast's persistent live region (default
    // assertive → role="alert"); the text lands a frame after mount.
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('All good')
    );
  });

  it('renders a notice as a success alert', () => {
    render(<FlashHandler flash={[['notice', 'All good']]} />);
    // The visible Alert (as opposed to the live region) is styled by type.
    const styled = screen
      .getAllByText('All good')
      .some(node => node.closest('[class*="alert-success"]'));
    expect(styled).toBe(true);
  });

  it('renders an alert as a danger alert', () => {
    render(<FlashHandler flash={[['alert', 'Something went wrong']]} />);
    const styled = screen
      .getAllByText('Something went wrong')
      .some(node => node.closest('[class*="alert-danger"]'));
    expect(styled).toBe(true);
  });

  it('uses the first message when multiple messages are provided', () => {
    render(
      <FlashHandler
        flash={[
          ['alert', ['Alert message 1', 'Alert message 2']],
          ['notice', ['Notice message 1', 'Notice message 2']],
        ]}
      />
    );

    expect(screen.getAllByText('Alert message 1').length).toBeGreaterThan(0);
    expect(screen.queryByText('Alert message 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Notice message 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Notice message 2')).not.toBeInTheDocument();
  });

  it('dismisses the toast when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<FlashHandler flash={[['alert', 'Dismiss me']]} />);

    expect(screen.getAllByText('Dismiss me').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', {name: 'Close alert'}));

    await waitFor(() => {
      expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
    });
  });

  it('reopens for a new flash after the previous one was dismissed', async () => {
    const user = userEvent.setup();
    const {rerender} = render(<FlashHandler flash={[['notice', 'First']]} />);

    await user.click(screen.getByRole('button', {name: 'Close alert'}));
    await waitFor(() => {
      expect(screen.queryByText('First')).not.toBeInTheDocument();
    });

    // A new flash on the still-mounted instance must show, not stay dismissed.
    rerender(<FlashHandler flash={[['notice', 'Second']]} />);
    expect(screen.getAllByText('Second').length).toBeGreaterThan(0);
  });
});
