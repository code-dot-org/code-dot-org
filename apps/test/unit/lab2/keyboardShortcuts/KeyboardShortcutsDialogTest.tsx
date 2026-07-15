import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import KeyboardShortcutsDialog from '@cdo/apps/lab2/keyboardShortcuts/KeyboardShortcutsDialog';

// Only 'sketchlab' has an entry; other labs have none.
jest.mock('@cdo/apps/lab2/keyboardShortcuts/shortcutsPerLab', () => ({
  ShortcutsPerLab: {
    sketchlab: {General: [{shortcut: 'Tab', explanation: 'Move focus'}]},
  },
}));

describe('KeyboardShortcutsDialog', () => {
  it('opens the shortcuts dialog on "/" for a lab with shortcuts', () => {
    render(<KeyboardShortcutsDialog appName="sketchlab" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.keyDown(document.body, {key: '/'});

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Move focus')).toBeInTheDocument();
  });

  it('closes the dialog with the close button', () => {
    render(<KeyboardShortcutsDialog appName="sketchlab" />);
    fireEvent.keyDown(document.body, {key: '/'});

    fireEvent.click(screen.getByLabelText('Close keyboard shortcuts'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the dialog with the Escape key', () => {
    render(<KeyboardShortcutsDialog appName="sketchlab" />);
    fireEvent.keyDown(document.body, {key: '/'});

    fireEvent.keyDown(document.body, {key: 'Escape'});

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not open when focus is in an editable field', () => {
    render(
      <>
        <KeyboardShortcutsDialog appName="sketchlab" />
        <input aria-label="field" />
      </>
    );
    fireEvent.keyDown(screen.getByLabelText('field'), {key: '/'});
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does nothing for a lab without shortcuts', () => {
    render(<KeyboardShortcutsDialog appName="music" />);
    fireEvent.keyDown(document.body, {key: '/'});
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
