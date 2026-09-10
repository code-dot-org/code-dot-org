// The project's backdrops, read as a shelf.
//
// Every act in it is the file menus' own (`files/FileMenus`), so what is worth
// pinning is the reading: that a backdrop is a tile you press to open, that the
// ways to get another are in the grid where the eye already is, and that the
// name is there for a screen reader even though no tile shows one.

import {render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {
  BackgroundPickerDialog,
  type BackgroundTile,
} from '../BackgroundPickerDialog';

const BACKGROUNDS: BackgroundTile[] = [
  {fileId: 'b1', name: 'Cave', url: 'data:image/png;base64,cave'},
  {fileId: 'b2', name: 'Court'},
];

const onOpen = vi.fn();
const onImport = vi.fn();
const onNew = vi.fn();
const onUpload = vi.fn();
const onCancel = vi.fn();

const show = (
  props: Partial<React.ComponentProps<typeof BackgroundPickerDialog>> = {},
) =>
  render(
    <BackgroundPickerDialog
      backgrounds={BACKGROUNDS}
      onOpen={onOpen}
      onImport={onImport}
      onNew={onNew}
      onUpload={onUpload}
      onCancel={onCancel}
      {...props}
    />,
  );

beforeEach(() => vi.clearAllMocks());

describe('the backdrop shelf', () => {
  it('gives every backdrop a tile that opens it', () => {
    show();

    screen.getByRole('button', {name: 'Open Cave'}).click();
    expect(onOpen).toHaveBeenCalledWith('b1');
  });

  it('draws each one from the bytes the project holds', () => {
    show();

    const thumb = screen
      .getByRole('button', {name: 'Open Cave'})
      .querySelector('img');
    expect(thumb?.getAttribute('src')).toBe('data:image/png;base64,cave');
    // Nothing for a screen reader to read twice: the button is already
    // labelled, so the picture inside it is decoration.
    expect(thumb?.getAttribute('alt')).toBe('');
  });

  it('gives a backdrop with no bytes a tile all the same', () => {
    // It is still the file the learner is looking for, and a shelf that hid it
    // would be a shelf missing a file the folder has.
    show();

    const blank = screen.getByRole('button', {name: 'Open Court'});
    expect(blank).toBeTruthy();
    expect(blank.querySelector('img')).toBeNull();
  });

  it('holds the three ways to get another one, in the grid', () => {
    show();

    screen.getByRole('button', {name: 'Import'}).click();
    expect(onImport).toHaveBeenCalled();
    screen.getByRole('button', {name: 'New'}).click();
    expect(onNew).toHaveBeenCalled();
    screen.getByRole('button', {name: 'Upload'}).click();
    expect(onUpload).toHaveBeenCalled();
  });

  it('leaves out the ones a locked level has no use for', () => {
    // The shelf stays: a locked level is still a level you look at.
    show({onNew: undefined, onUpload: undefined});

    expect(screen.queryByRole('button', {name: 'New'})).toBeNull();
    expect(screen.queryByRole('button', {name: 'Upload'})).toBeNull();
    expect(screen.getByRole('button', {name: 'Import'})).toBeTruthy();
    expect(screen.getByRole('button', {name: 'Open Cave'})).toBeTruthy();
  });

  it('says when there is nothing to show', () => {
    show({backgrounds: []});

    expect(
      screen.getByText('This project has no backgrounds yet.'),
    ).toBeTruthy();
  });
});
