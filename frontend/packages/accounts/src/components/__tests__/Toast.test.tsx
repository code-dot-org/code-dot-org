import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import {ToastProvider, useToast} from '../Toast';

function Trigger({message}: {message: string}) {
  const toast = useToast();
  return <button onClick={() => toast(message)}>fire</button>;
}

describe('Toast', () => {
  it('announces the message via a persistent polite live region', async () => {
    render(
      <ToastProvider>
        <Trigger message="Saved!" />
      </ToastProvider>,
    );
    // The live region exists and is empty BEFORE any toast, so a screen reader
    // reliably announces when its text changes (rather than a node inserted
    // already containing the text).
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toBeEmptyDOMElement();

    fireEvent.click(screen.getByRole('button', {name: 'fire'}));

    await waitFor(() => expect(liveRegion).toHaveTextContent('Saved!'));
  });

  it('no-ops without a provider', () => {
    render(<Trigger message="Saved!" />);
    expect(() =>
      fireEvent.click(screen.getByRole('button', {name: 'fire'})),
    ).not.toThrow();
    expect(screen.queryByText('Saved!')).toBeNull();
  });
});
