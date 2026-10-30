import {act, render, screen, fireEvent} from '@testing-library/react';
import React from 'react';

import LevelGroupSubmitDialog, {
  showLevelGroupSubmitDialog,
} from '@cdo/apps/code-studio/levels/LevelGroupSubmitDialog';
import experiments from '@cdo/apps/util/experiments';

const DIALOG_PROPS = {
  id: 'levelgroup-submit-complete-dialogcontent',
  title: 'Submit your survey',
  body: 'You cannot edit your survey after submitting it.',
};

describe('LevelGroupSubmitDialog', () => {
  it('renders the title, body and both buttons', () => {
    render(
      <LevelGroupSubmitDialog
        {...DIALOG_PROPS}
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toHaveAttribute('id', DIALOG_PROPS.id);
    expect(screen.getByText(DIALOG_PROPS.title)).toBeInTheDocument();
    expect(screen.getByText(DIALOG_PROPS.body)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Okay'})).toHaveAttribute(
      'id',
      'levelgroup-submit-ok-button'
    );
    expect(screen.getByRole('button', {name: 'Cancel'})).toHaveAttribute(
      'id',
      'levelgroup-submit-cancel-button'
    );
  });

  it('calls onConfirm from OK and onCancel from Cancel', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    render(
      <LevelGroupSubmitDialog
        {...DIALOG_PROPS}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Okay'}));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel from the close button', () => {
    const onCancel = jest.fn();
    render(
      <LevelGroupSubmitDialog
        {...DIALOG_PROPS}
        onConfirm={() => {}}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByRole('button', {name: 'Close dialog'}));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe('showLevelGroupSubmitDialog', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('mounts the dialog under body, and OK closes it then confirms', () => {
    const onConfirm = jest.fn();
    // act() flushes the effects that install the dialog's key handlers.
    act(() => showLevelGroupSubmitDialog(DIALOG_PROPS, onConfirm));

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Okay'}));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('Cancel closes the dialog without confirming', () => {
    const onConfirm = jest.fn();
    // act() flushes the effects that install the dialog's key handlers.
    act(() => showLevelGroupSubmitDialog(DIALOG_PROPS, onConfirm));

    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('Escape closes the dialog without confirming', () => {
    const onConfirm = jest.fn();
    // act() flushes the effects that install the dialog's key handlers.
    act(() => showLevelGroupSubmitDialog(DIALOG_PROPS, onConfirm));

    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows nothing when the bypass-dialog-popup experiment is enabled', () => {
    const isEnabled = jest
      .spyOn(experiments, 'isEnabled')
      .mockImplementation(key => key === experiments.BYPASS_DIALOG_POPUP);
    const onConfirm = jest.fn();
    act(() => showLevelGroupSubmitDialog(DIALOG_PROPS, onConfirm));

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    isEnabled.mockRestore();
  });
});
