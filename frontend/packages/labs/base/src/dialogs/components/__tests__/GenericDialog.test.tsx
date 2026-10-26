// The lab dialogs, shown the way a lab shows them: through `showDialog`.
//
// What is pinned here is what the move onto the design system's Dialog had to
// keep. A dialog is announced as one to assistive technology; Enter confirms, because a
// prompt is typed into and submitted that way; Escape cancels, and dismisses an
// alert that has no cancel button to press.

import {act, fireEvent, render, screen} from '@testing-library/react';
import {useEffect} from 'react';
import {describe, expect, it} from 'vitest';

import {
  DialogControlProvider,
  useDialogControl,
} from '../../../contexts/DialogControlContext';
import DialogViews from '../../DialogViews';
import type {DialogClosePromiseReturnType, TypedDialogProps} from '../../types';

/** Shows one dialog on mount, and keeps how it closed. */
const Shows = ({
  dialog,
  closed,
}: {
  dialog: TypedDialogProps;
  closed: DialogClosePromiseReturnType[];
}) => {
  const {showDialog} = useDialogControl();
  useEffect(() => {
    void showDialog(dialog).then(result => closed.push(result));
  }, [dialog, showDialog, closed]);
  return null;
};

const show = (dialog: TypedDialogProps) => {
  const closed: DialogClosePromiseReturnType[] = [];
  render(
    <DialogControlProvider dialogViews={DialogViews}>
      <Shows dialog={dialog} closed={closed} />
    </DialogControlProvider>,
  );
  return closed;
};

const press = async (key: string) => {
  await act(async () => {
    fireEvent.keyDown(document, {key});
  });
};

describe('GenericDialog', () => {
  it('is an alert dialog, named by its title', () => {
    // `alertdialog` rather than `dialog`: the design system's Dialog is for
    // asking, and a screen reader announces it at once.
    show({type: 'GenericConfirmation', title: 'Delete it?', message: 'Sure?'});

    expect(screen.getByRole('alertdialog', {name: 'Delete it?'})).toBeVisible();
  });

  it('confirms on Enter', async () => {
    const closed = show({
      type: 'GenericConfirmation',
      title: 'Delete it?',
      message: 'Sure?',
    });

    await press('Enter');

    expect(closed).toEqual([{type: 'confirm', args: undefined}]);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('cancels on Escape', async () => {
    const closed = show({
      type: 'GenericConfirmation',
      title: 'Delete it?',
      message: 'Sure?',
    });

    await press('Escape');

    expect(closed.map(each => each.type)).toEqual(['cancel']);
  });

  it('dismisses an alert on Escape, though it has no cancel button', async () => {
    const closed = show({
      type: 'GenericAlert',
      title: 'Saved',
      message: 'Done.',
    });
    expect(screen.queryByRole('button', {name: 'Cancel'})).toBeNull();

    await press('Escape');

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(closed).toHaveLength(1);
  });

  it('closes by the button that was pressed', async () => {
    const closed = show({
      type: 'GenericConfirmation',
      title: 'Delete it?',
      message: 'Sure?',
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));
    });

    expect(closed.map(each => each.type)).toEqual(['cancel']);
  });
});
