// The project's backdrops, read as a shelf.
//
// Every act in it is the file menus' own (`files/FileMenus`), so what is worth
// pinning is the reading: that a backdrop is a tile you press to open, that the
// ways to get another are in the grid where the eye already is, and that the
// name is there for a screen reader even though no tile shows one.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {
  BackgroundPickerDialog,
  type BackgroundTile,
} from '../BackgroundPickerDialog';
import type {GeneratedPicture} from '../generate/imageGenerator';

const BACKGROUNDS: BackgroundTile[] = [
  {fileId: 'b1', name: 'Cave', url: 'data:image/png;base64,cave'},
  {fileId: 'b2', name: 'Court'},
];

const onOpen = vi.fn();
const onImport = vi.fn();
const onNew = vi.fn();
const onUpload = vi.fn();
const onCancel = vi.fn();

/** A generator that answers at once, so the tests are about the flow. */
const DRAWN: GeneratedPicture[] = [
  {name: 'cave', dataUrl: 'data:image/png;base64,AAAA', mediaType: 'image/png'},
];
const draw = vi.fn(async () => DRAWN);
const onKeep = vi.fn(async () => 'cave.png');

/** The shelf with the fourth way in behind its tile. */
const canDraw = () => ({drawing: {kind: 'fixture' as const, draw}, onKeep});

/** Open the panel, ask for a picture, and wait for one. */
const drawOne = async () => {
  fireEvent.click(screen.getByRole('button', {name: 'Describe'}));
  fireEvent.change(screen.getByLabelText('Describe a picture'), {
    target: {value: 'a cave'},
  });
  fireEvent.click(screen.getByRole('button', {name: /^Draw$/}));
  await screen.findByRole('button', {name: 'Keep this one'});
};

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

describe('describing a backdrop', () => {
  it('is a tile like the other three, and takes the whole view', () => {
    // It used to be a strip under the shelf, because a sentence does not fit
    // in a tile. The sentence lives in a view of its own now, so getting there
    // is a press like the rest (`generate/DescribePicture`).
    show(canDraw());
    expect(screen.queryByLabelText('Describe a picture')).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));
    expect(screen.getByLabelText('Describe a picture')).toBeTruthy();
    // …and the shelf is out of the way while it is up.
    expect(screen.queryByRole('button', {name: 'Open Cave'})).toBeNull();
  });

  it('gives the shelf back', () => {
    show(canDraw());
    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));

    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    expect(screen.getByRole('button', {name: 'Open Cave'})).toBeTruthy();
  });

  it('asks for no shape, which would mean nothing here', () => {
    // A backdrop is stretched over the viewport and has no tiles to fill.
    show(canDraw());
    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));

    expect(screen.queryByLabelText('How many tiles it fills')).toBeNull();
  });

  it('is not offered where nothing can draw, or nothing may be written', () => {
    show();
    expect(screen.queryByRole('button', {name: 'Describe'})).toBeNull();

    show({onKeep});
    expect(screen.queryByRole('button', {name: 'Describe'})).toBeNull();
  });

  it('keeps what is drawn when the learner presses Done', async () => {
    // The same trap the Actor Creator had: choosing one off the shelf costs
    // one press, so a drawn one wanting a second — beside the button you were
    // going to press anyway — is one that gets left behind.
    show(canDraw());
    await drawOne();

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('stays up when the write refused, rather than closing over it', async () => {
    onKeep.mockResolvedValueOnce(undefined as never);
    show(canDraw());
    await drawOne();

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalled());
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Describe a picture')).toBeTruthy();
  });

  it('does not keep one the learner walked away from', async () => {
    show(canDraw());
    await drawOne();

    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    expect(onKeep).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  it('closes without writing when nothing was drawn', async () => {
    show(canDraw());

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    expect(onKeep).not.toHaveBeenCalled();
    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled());
  });
});

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

  it('holds the ways to get another one, in the grid', () => {
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
