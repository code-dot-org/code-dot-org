// The palette: everything the project can draw, in one place.
//
// A spritesheet is taken apart, so choosing a drawing is one question rather
// than two ("which picture", then "which cell of it"). The tiles carry no text
// — the names are there for a screen reader, which is what these tests read.

import {fireEvent, render, screen} from '@testing-library/react';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {GeneratedPicture} from '../../appearance/generate/imageGenerator';
import type {SheetFile} from '../../appearance/sheetFile';
import {SpritePickerDialog} from '../SpritePickerDialog';

const SHEET: SheetFile = {type: 'sheet', cell: {width: 32, height: 32}};

/** An image of `columns` cells in a row, as far as the palette can tell. */
const image = (columns: number): HTMLImageElement =>
  ({width: columns * 32, height: 32, src: 'data:,'}) as HTMLImageElement;

/** A generator that answers at once, so the tests are about the flow. */
const DRAWN: GeneratedPicture[] = [
  {name: 'crab', dataUrl: 'data:image/png;base64,AAAA', mediaType: 'image/png'},
];
const draw = vi.fn(async () => DRAWN);
const onKeep = vi.fn(async () => 'crab.png');

/** The palette with the fourth way in behind its tile. */
const canDraw = () => ({drawing: {kind: 'fixture' as const, draw}, onKeep});

/** Open the panel, ask for a picture, and wait for one. */
const drawOne = async () => {
  fireEvent.click(screen.getByRole('button', {name: 'Describe'}));
  fireEvent.change(screen.getByLabelText('Describe a picture'), {
    target: {value: 'a purple crab'},
  });
  fireEvent.click(screen.getByRole('button', {name: /^Draw$/}));
  await screen.findByRole('button', {name: 'Keep this one'});
};

beforeEach(() => vi.clearAllMocks());

const open = (
  props: Partial<React.ComponentProps<typeof SpritePickerDialog>> = {},
) =>
  render(
    <SpritePickerDialog
      sprites={['player.png', 'coinSpin.png']}
      images={{'player.png': image(1), 'coinSpin.png': image(6)}}
      sheets={{'coinSpin.png': SHEET}}
      onPick={vi.fn()}
      onImport={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );

describe('SpritePickerDialog', () => {
  it('shows a picture once and a spritesheet as its cells', () => {
    open();

    // One tile for the picture, six for the strip — and no second question.
    expect(
      screen.getByRole('button', {name: 'player.png'}),
    ).toBeInTheDocument();
    for (let n = 1; n <= 6; n++) {
      expect(
        screen.getByRole('button', {name: `coinSpin.png, cell ${n}`}),
      ).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', {pressed: false})).toHaveLength(7);
  });

  it('hands back the cell it was told to show', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.click(screen.getByRole('button', {name: 'coinSpin.png, cell 4'}));
    fireEvent.click(screen.getByRole('button', {name: 'Use this picture'}));

    expect(onPick).toHaveBeenCalledWith({
      sprite: 'coinSpin.png',
      cell: 3,
      rect: {x: 96, y: 0, width: 32, height: 32},
    });
  });

  it('hands back a whole picture with no cell at all', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.dblClick(screen.getByRole('button', {name: 'player.png'}));

    expect(onPick).toHaveBeenCalledWith({
      sprite: 'player.png',
      cell: undefined,
      rect: undefined,
    });
  });

  it('starts on the tile that is drawn now', () => {
    open({current: {sprite: 'coinSpin.png', cell: 2}});

    expect(
      screen.getByRole('button', {name: 'coinSpin.png, cell 3'}),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('button', {name: 'Use this picture'}),
    ).toBeEnabled();
  });

  it('waits for the primary button rather than picking on a click', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.click(screen.getByRole('button', {name: 'player.png'}));
    expect(onPick).not.toHaveBeenCalled();
  });

  it('leads to the library, and says when there is nothing yet', () => {
    // In the GRID, where the eye already is: noticing you want another picture
    // happens while you are looking at the ones you have.
    const onImport = vi.fn();
    open({sprites: [], images: {}, onImport});

    expect(screen.getByText(/no pictures yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Import'}));
    expect(onImport).toHaveBeenCalled();
  });

  it('offers the other two ways only when there are two ways', () => {
    // A blank one to draw on and a file off this machine are the file menus'
    // to offer; the palette inside the animation editor has neither.
    const onNew = vi.fn();
    const onUpload = vi.fn();
    open({onNew, onUpload});

    screen.getByRole('button', {name: 'New'}).click();
    screen.getByRole('button', {name: 'Upload'}).click();
    expect(onNew).toHaveBeenCalled();
    expect(onUpload).toHaveBeenCalled();
  });

  it('opens on a press where a press is the whole act', () => {
    // The file menus pick a picture to OPEN, and waiting for a second click
    // there would be asking twice for one answer.
    const onPick = vi.fn();
    open({onPick, chooseOnPress: true});

    fireEvent.click(screen.getByRole('button', {name: 'player.png'}));
    expect(onPick).toHaveBeenCalledWith({
      sprite: 'player.png',
      cell: undefined,
      rect: undefined,
    });
  });

  it('leaves out an image that has not decoded', () => {
    // Nothing to look at is nothing to choose; it appears when it arrives.
    open({images: {'player.png': image(1)}});

    expect(
      screen.getByRole('button', {name: 'player.png'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', {name: /coinSpin/})).toBeNull();
  });
});

describe('describing a picture', () => {
  it('is a tile like the other three, and takes the whole palette', () => {
    open(canDraw());
    expect(screen.queryByLabelText('Describe a picture')).toBeNull();

    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));
    expect(screen.getByLabelText('Describe a picture')).toBeTruthy();
    expect(screen.queryByRole('button', {name: 'player.png'})).toBeNull();
  });

  it('gives the palette back', () => {
    open(canDraw());
    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));

    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    expect(screen.getByRole('button', {name: 'player.png'})).toBeTruthy();
  });

  it('is not offered where nothing can draw, or nothing may be written', () => {
    open();
    expect(screen.queryByRole('button', {name: 'Describe'})).toBeNull();

    open({onKeep});
    expect(screen.queryByRole('button', {name: 'Describe'})).toBeNull();
  });

  it('asks for no shape, which a picture in a folder has no answer to', () => {
    // How many tiles an ACTOR fills is a question the Actor Creator asks about
    // the actor, not one the palette can ask about a file
    // (`actors/create/ActorCreator`).
    open(canDraw());
    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));

    expect(screen.queryByLabelText('How many tiles it fills')).toBeNull();
  });

  it('asks what it is, which this folder cannot tell from the door', async () => {
    // `player.png` and `ground.png` are both sprites. A stone wall asked for
    // as a thing comes back as a picture OF a wall, sitting on nothing.
    open(canDraw());
    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));

    expect(screen.getByLabelText('What it is')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', {name: /A surface/}));
    fireEvent.change(screen.getByLabelText('Describe a picture'), {
      target: {value: 'mossy stone bricks'},
    });
    fireEvent.click(screen.getByRole('button', {name: /^Draw$/}));

    await vi.waitFor(() => expect(draw).toHaveBeenCalled());
    const asked = draw.mock.calls.at(-1) as unknown as [{kind?: string}];
    expect(asked[0].kind).toBe('tile');
  });

  it('starts on a thing, which most sprites are', () => {
    open(canDraw());
    fireEvent.click(screen.getByRole('button', {name: 'Describe'}));

    expect(screen.getByRole('button', {name: /A thing/})).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('keeps what is drawn when Done closes the shelf', async () => {
    // The shelf reading of this dialog, which is the file menus'. Choosing a
    // picture off it costs one press, so a drawn one must not want a second.
    const onCancel = vi.fn();
    open({...canDraw(), chooseOnPress: true, onCancel});
    await drawOne();

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    await vi.waitFor(() => expect(onCancel).toHaveBeenCalled());
  });

  it('keeps what is drawn, and uses it, when the confirm is the answer', async () => {
    // …and the palette reading, where the confirm names a drawing rather than
    // closing. The one that lands is the answer.
    const onPick = vi.fn();
    open({...canDraw(), onPick});
    await drawOne();

    fireEvent.click(screen.getByRole('button', {name: 'Use this picture'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalledWith(DRAWN[0]));
    await vi.waitFor(() =>
      expect(onPick).toHaveBeenCalledWith({sprite: 'crab.png'}),
    );
  });

  it('lets a drawn picture answer where nothing is selected', () => {
    // Nothing pressed and nothing drawn is nothing to confirm; a drawn one is
    // an answer before it is a file.
    open(canDraw());
    expect(
      screen.getByRole('button', {name: 'Use this picture'}),
    ).toBeDisabled();
  });

  it('stays up when the write refused, rather than acting without it', async () => {
    onKeep.mockResolvedValueOnce(undefined as never);
    const onCancel = vi.fn();
    open({...canDraw(), chooseOnPress: true, onCancel});
    await drawOne();

    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    await vi.waitFor(() => expect(onKeep).toHaveBeenCalled());
    expect(onCancel).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Describe a picture')).toBeTruthy();
  });

  it('does not keep one the learner walked away from', async () => {
    const onCancel = vi.fn();
    open({...canDraw(), chooseOnPress: true, onCancel});
    await drawOne();

    fireEvent.click(screen.getByRole('button', {name: /Choose a picture/}));
    fireEvent.click(screen.getByRole('button', {name: 'Done'}));

    expect(onKeep).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });
});
