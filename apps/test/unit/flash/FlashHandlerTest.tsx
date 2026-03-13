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

  it('renders the first flash message with mapped alert type for notice', () => {
    render(<FlashHandler flash={[['notice', 'All good']]} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute(
      'class',
      expect.stringContaining('alert-success')
    );
    expect(screen.getByText('All good')).toBeInTheDocument();
  });

  it('renders the first flash message with mapped alert type for alert', () => {
    render(<FlashHandler flash={[['alert', 'Something went wrong']]} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute(
      'class',
      expect.stringContaining('alert-danger')
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
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

    expect(screen.getByText('Alert message 1')).toBeInTheDocument();
    expect(screen.queryByText('Alert message 2')).not.toBeInTheDocument();
    expect(screen.queryByText('Notice message 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Notice message 2')).not.toBeInTheDocument();
  });

  it('closes the snackbar when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(<FlashHandler flash={[['alert', 'Dismiss me']]} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Close alert'}));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
