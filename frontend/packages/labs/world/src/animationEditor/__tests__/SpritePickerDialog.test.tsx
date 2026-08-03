// The palette: everything the project can draw, in one place.
//
// A spritesheet is taken apart, so choosing a drawing is one question rather
// than two ("which picture", then "which cell of it"). The tiles carry no text
// — the names are there for a screen reader, which is what these tests read.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {SheetFile} from '../../appearance/sheetFile';
import {SpritePickerDialog} from '../SpritePickerDialog';

const SHEET: SheetFile = {type: 'sheet', cell: {width: 32, height: 32}};

/** An image of `columns` cells in a row, as far as the palette can tell. */
const image = (columns: number): HTMLImageElement =>
  ({width: columns * 32, height: 32, src: 'data:,'}) as HTMLImageElement;

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
    const onImport = vi.fn();
    open({sprites: [], images: {}, onImport});

    expect(screen.getByText(/no pictures yet/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: /Import a picture/}));
    expect(onImport).toHaveBeenCalled();
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
