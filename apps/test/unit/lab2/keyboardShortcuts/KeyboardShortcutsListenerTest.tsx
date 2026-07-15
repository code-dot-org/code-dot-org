import {render, screen, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import KeyboardShortcutsListener from '@cdo/apps/lab2/keyboardShortcuts/KeyboardShortcutsListener';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';

jest.mock('@cdo/apps/lab2/views/dialogs', () => ({
  ...jest.requireActual('@cdo/apps/lab2/views/dialogs'),
  useDialogControl: jest.fn(),
}));

// Only 'sketchlab' has an entry; other labs have none.
jest.mock('@cdo/apps/lab2/keyboardShortcuts/shortcutsPerLab', () => ({
  ShortcutsPerLab: {
    sketchlab: {General: [{shortcut: 'Tab', explanation: 'Move focus'}]},
  },
}));

const mockUseDialogControl = useDialogControl as jest.Mock;

describe('KeyboardShortcutsListener', () => {
  let showDialog: jest.Mock;

  beforeEach(() => {
    showDialog = jest.fn().mockResolvedValue({type: 'confirm'});
    mockUseDialogControl.mockReturnValue({showDialog});
  });

  it('opens the shortcuts dialog on "/" for a lab with shortcuts', () => {
    render(<KeyboardShortcutsListener appName="sketchlab" />);
    fireEvent.keyDown(document.body, {key: '/'});
    expect(showDialog).toHaveBeenCalledTimes(1);
    expect(showDialog).toHaveBeenCalledWith(
      expect.objectContaining({type: DialogType.GenericDialog, useModal: true})
    );
  });

  it('does not open while a dialog is already open', () => {
    // A pending promise keeps the reentry guard engaged.
    showDialog.mockReturnValue(new Promise(() => {}));
    render(<KeyboardShortcutsListener appName="sketchlab" />);
    fireEvent.keyDown(document.body, {key: '/'});
    fireEvent.keyDown(document.body, {key: '/'});
    expect(showDialog).toHaveBeenCalledTimes(1);
  });

  it('does not open when focus is in an editable field', () => {
    render(
      <>
        <KeyboardShortcutsListener appName="sketchlab" />
        <input aria-label="field" />
      </>
    );
    fireEvent.keyDown(screen.getByLabelText('field'), {key: '/'});
    expect(showDialog).not.toHaveBeenCalled();
  });

  it('does nothing for a lab without shortcuts', () => {
    render(<KeyboardShortcutsListener appName="music" />);
    fireEvent.keyDown(document.body, {key: '/'});
    expect(showDialog).not.toHaveBeenCalled();
  });
});
