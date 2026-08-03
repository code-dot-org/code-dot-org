// The backdrop shelf.
//
// Thumbnails with no text on them, so these tests read what a screen reader
// reads. What matters beyond that is the fetch: a backdrop's bytes are served
// rather than bundled, so choosing one can fail in a way choosing a sprite
// cannot, and the dialog has to survive that with something to try again.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import {setBackgroundBaseUrl} from '../../runtime/worldConfig';
import {BackgroundLibraryDialog} from '../BackgroundLibraryDialog';

const open = (
  props: Partial<React.ComponentProps<typeof BackgroundLibraryDialog>> = {},
) =>
  render(
    <BackgroundLibraryDialog
      onImport={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );

describe('BackgroundLibraryDialog', () => {
  it('shows the shelf, by name for a screen reader', () => {
    open();

    expect(screen.getByRole('button', {name: 'Cave'})).toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Sun and rainbow'}),
    ).toBeInTheDocument();
  });

  it('points each thumbnail at where setup put the bytes', () => {
    setBackgroundBaseUrl('/backgrounds/');
    open();

    expect(
      screen.getByRole('button', {name: 'Cave'}).querySelector('img'),
    ).toHaveAttribute('src', '/backgrounds/cave.png');
  });

  it('waits for the button rather than importing on a click', () => {
    const onImport = vi.fn();
    open({onImport});

    fireEvent.click(screen.getByRole('button', {name: 'Cave'}));
    expect(onImport).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', {name: 'Use this background'}));
    expect(onImport).toHaveBeenCalledWith(
      expect.objectContaining({id: 'cave', name: 'Cave'}),
    );
  });

  it('has nothing to confirm until something is chosen', () => {
    open();

    expect(
      screen.getByRole('button', {name: 'Use this background'}),
    ).toBeDisabled();
  });

  it('says it is working, and refuses a second start while it is', () => {
    // The fetch is the slow part; a dialog that looked idle would invite a
    // second click on it.
    const onImport = vi.fn();
    open({busy: true, onImport});

    expect(screen.getByRole('button', {name: 'Adding…'})).toBeDisabled();
    fireEvent.dblClick(screen.getByRole('button', {name: 'Cave'}));
    expect(onImport).not.toHaveBeenCalled();
  });

  it('stays open and says what went wrong', () => {
    // The dialog outlives a failed fetch on purpose: a backdrop setup could not
    // reach is one the learner can try again, or pick around.
    open({error: 'Could not load the background “Cave” (404).'});

    expect(
      screen.getByText('Could not load the background “Cave” (404).'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cave'})).toBeInTheDocument();
  });
});
