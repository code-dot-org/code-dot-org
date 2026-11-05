// The keyboard shortcuts dialog and the `/` key that opens it.

import {fireEvent, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {describe, expect, it} from 'vitest';

import {
  KeyboardShortcutsDialog,
  useKeyboardShortcutsKey,
} from '../components/KeyboardShortcuts';

const SHORTCUTS = {
  Editing: [{shortcut: 'Esc', explanation: 'Finish editing'}],
  History: [{shortcut: 'Ctrl / Cmd + Z', explanation: 'Undo'}],
};

const Host = () => {
  const [open, setOpen] = useState(false);
  useKeyboardShortcutsKey(() => setOpen(true), !open);
  return (
    <>
      <input aria-label="Name" />
      <KeyboardShortcutsDialog
        shortcuts={SHORTCUTS}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

describe('the keyboard shortcuts dialog', () => {
  it('opens on /, and lists each category as a table', () => {
    render(<Host />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.keyDown(document.body, {key: '/'});
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('rowheader', {name: 'Esc'})).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getAllByRole('table')).toHaveLength(2);
  });

  it('leaves / alone in a field, and with Ctrl', () => {
    render(<Host />);
    fireEvent.keyDown(screen.getByLabelText('Name'), {key: '/'});
    fireEvent.keyDown(document.body, {key: '/', ctrlKey: true});
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes', () => {
    render(<Host />);
    fireEvent.keyDown(document.body, {key: '/'});
    fireEvent.click(
      screen.getByRole('button', {name: 'Close keyboard shortcuts'}),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
