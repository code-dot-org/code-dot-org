import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ToastProvider, useToast} from '../Toast';

function Trigger({message}: {message: string}) {
  const toast = useToast();
  return <button onClick={() => toast(message)}>fire</button>;
}

describe('Toast', () => {
  it('shows a success message when triggered within the provider', async () => {
    render(
      <ToastProvider>
        <Trigger message="Saved!" />
      </ToastProvider>,
    );
    expect(screen.queryByText('Saved!')).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'fire'}));
    expect(await screen.findByText('Saved!')).toBeInTheDocument();
  });

  it('no-ops without a provider', () => {
    render(<Trigger message="Saved!" />);
    expect(() =>
      fireEvent.click(screen.getByRole('button', {name: 'fire'})),
    ).not.toThrow();
    expect(screen.queryByText('Saved!')).toBeNull();
  });
});
