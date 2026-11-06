import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

import ScenesDialog from '@cdo/apps/p5lab/spritelab/lab2/views/ScenesDialog';

const scenes = [
  {id: 'a', name: 'Intro', thumbnail: '/thumb-a.png'},
  {id: 'b', name: 'Cave'},
];

function renderDialog(
  props: Partial<React.ComponentProps<typeof ScenesDialog>> = {}
) {
  const handlers = {
    onCreateScene: jest.fn(),
    onRenameScene: jest.fn(),
    onDeleteScene: jest.fn(),
    onMakeStartScene: jest.fn(),
    onClose: jest.fn(),
  };
  render(
    <ThemeProvider>
      <ScenesDialog scenes={scenes} editable {...handlers} {...props} />
    </ThemeProvider>
  );
  return handlers;
}

describe('ScenesDialog', () => {
  it('is a dialog named All scenes that Done, the cross and Escape close', () => {
    const {onClose} = renderDialog();
    expect(screen.getByRole('alertdialog', {name: 'All scenes'})).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));
    fireEvent.click(screen.getByRole('button', {name: 'Close dialog'}));
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onClose).toHaveBeenCalledTimes(3);
  });

  it('marks the first scene as where play starts, and makes another the start', () => {
    const {onMakeStartScene} = renderDialog();
    expect(screen.getByText('Starts here')).toBeTruthy();
    // Only the other scene can be made the start.
    const buttons = screen.getAllByRole('button', {name: 'Start here'});
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(onMakeStartScene).toHaveBeenCalledWith('b');
  });

  it('renames from the pencil, saving on Enter or the check', () => {
    const {onRenameScene} = renderDialog();
    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    const input = screen.getByRole('textbox', {name: 'Scene name'});
    fireEvent.change(input, {target: {value: '  Deep Cave '}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onRenameScene).toHaveBeenCalledWith('b', 'Deep Cave');

    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Scene name'}), {
      target: {value: 'Cavern'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Save name'}));
    expect(onRenameScene).toHaveBeenCalledWith('b', 'Cavern');
  });

  it('drops a blank name and cancels on the cross or Escape, keeping the dialog', () => {
    const {onRenameScene, onClose} = renderDialog();
    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Scene name'}), {
      target: {value: '   '},
    });
    expect(screen.getByRole('button', {name: 'Save name'})).toBeDisabled();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel name'}));
    expect(screen.queryByRole('textbox', {name: 'Scene name'})).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Rename Cave'}));
    fireEvent.keyDown(screen.getByRole('textbox', {name: 'Scene name'}), {
      key: 'Escape',
    });
    expect(screen.queryByRole('textbox', {name: 'Scene name'})).toBeNull();
    expect(onRenameScene).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('deletes only after confirming', () => {
    const {onDeleteScene} = renderDialog();
    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[1]);
    expect(onDeleteScene).not.toHaveBeenCalled();
    expect(screen.getByText('Delete this scene?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: 'Keep'}));
    expect(screen.queryByText('Delete this scene?')).toBeNull();

    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[1]);
    // The confirming card now shows the red Delete in place of its own.
    fireEvent.click(screen.getAllByRole('button', {name: 'Delete'})[1]);
    expect(onDeleteScene).toHaveBeenCalledWith('b');
  });

  it('offers no delete for the last scene', () => {
    renderDialog({scenes: [scenes[0]]});
    expect(screen.queryByRole('button', {name: 'Delete'})).toBeNull();
  });

  it('names a new scene before making it, holding the rest still meanwhile', async () => {
    const {onCreateScene} = renderDialog();
    fireEvent.click(screen.getByRole('button', {name: 'New scene'}));
    const input = screen.getByRole('textbox', {name: 'Scene name'});
    await waitFor(() => expect(input).toHaveFocus());
    expect(screen.getByRole('button', {name: 'Save name'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'New scene'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Done'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Rename Cave'})).toBeDisabled();
    expect(screen.getAllByRole('button', {name: 'Delete'})[1]).toBeDisabled();
    fireEvent.change(input, {target: {value: ' Boss room '}});
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(onCreateScene).toHaveBeenCalledWith('Boss room');
    expect(screen.queryByRole('textbox', {name: 'Scene name'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Done'})).not.toBeDisabled();
  });

  it('cancelling the name makes no scene', () => {
    const {onCreateScene} = renderDialog();
    fireEvent.click(screen.getByRole('button', {name: 'New scene'}));
    fireEvent.change(screen.getByRole('textbox', {name: 'Scene name'}), {
      target: {value: 'Boss room'},
    });
    fireEvent.click(screen.getByRole('button', {name: 'Cancel name'}));
    expect(onCreateScene).not.toHaveBeenCalled();
    expect(screen.queryByRole('textbox', {name: 'Scene name'})).toBeNull();
    expect(
      screen.getByRole('button', {name: 'Rename Cave'})
    ).not.toBeDisabled();
  });

  it('opens on a new scene waiting for its name when asked', async () => {
    renderDialog({creating: true});
    const input = screen.getByRole('textbox', {name: 'Scene name'});
    await waitFor(() => expect(input).toHaveFocus());
  });

  it('hides every editing control when not editable', () => {
    renderDialog({editable: false});
    expect(screen.queryByRole('button', {name: 'Delete'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Start here'})).toBeNull();
    expect(screen.queryByText('Starts here')).toBeNull();
    expect(screen.queryByRole('button', {name: 'New scene'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Rename Cave'})).toBeNull();
    expect(screen.getByText('Cave')).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Done'})).toBeTruthy();
  });
});
