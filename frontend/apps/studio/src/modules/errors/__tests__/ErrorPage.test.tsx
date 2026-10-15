import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';

import {ErrorPage} from '../ErrorPage';

describe('ErrorPage', () => {
  it('renders title and description', () => {
    render(<ErrorPage title="Oops" description="Something broke." />);
    expect(screen.getByRole('heading', {name: 'Oops'})).toBeInTheDocument();
    expect(screen.getByText('Something broke.')).toBeInTheDocument();
  });

  it('renders event ID when provided', () => {
    render(
      <ErrorPage
        title="Oops"
        description="Something broke."
        eventId="abc-123"
      />,
    );
    expect(screen.getByText(/abc-123/)).toBeInTheDocument();
  });

  it('does not render event ID when absent', () => {
    render(<ErrorPage title="Oops" description="Something broke." />);
    expect(screen.queryByText(/Event ID/)).not.toBeInTheDocument();
  });

  it('renders actions slot', () => {
    render(
      <ErrorPage
        title="Oops"
        description="Something broke."
        actions={<button>Retry</button>}
      />,
    );
    expect(screen.getByRole('button', {name: 'Retry'})).toBeInTheDocument();
  });
});
