import {act, fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import {HEADER_ACTION_ID} from '@cdo/apps/code-studio/components/header/SimpleHeader';
import HeaderActionButton from '@cdo/apps/lab2/views/components/HeaderActionButton';

describe('HeaderActionButton', () => {
  afterEach(() => {
    document.getElementById(HEADER_ACTION_ID)?.remove();
  });

  it('draws its button in the header slot, and the click is its own', () => {
    const slot = document.createElement('div');
    slot.id = HEADER_ACTION_ID;
    document.body.appendChild(slot);
    const onClick = jest.fn();
    render(
      <HeaderActionButton onClick={onClick} buttonColor="success">
        I'm finished
      </HeaderActionButton>
    );
    const button = screen.getByRole('button', {name: "I'm finished"});
    expect(slot.contains(button)).toBe(true);
    expect(button.classList.contains('success')).toBe(true);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('waits for the slot when the header has not drawn yet', async () => {
    render(<HeaderActionButton onClick={jest.fn()}>Done</HeaderActionButton>);
    expect(screen.queryByRole('button')).toBeNull();
    const slot = document.createElement('div');
    slot.id = HEADER_ACTION_ID;
    await act(async () => {
      document.body.appendChild(slot);
      // The observer reports on the next microtask.
      await Promise.resolve();
    });
    expect(slot.contains(screen.getByRole('button', {name: 'Done'}))).toBe(
      true
    );
  });
});
