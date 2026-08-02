// Turning a spritesheet into frames.
//
// What this has to get right is the ORDER: a walk cycle played out of order is
// not a walk. So the picker says where each cell lands, and hands back reading
// order however the cells were clicked.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {SheetFile} from '../../appearance/sheetFile';
import {AddFramesDialog} from '../AddFramesDialog';

const SHEET: SheetFile = {type: 'sheet', cell: {width: 32, height: 32}};

/** An image of `cells` squares in a row, as far as this dialog can tell. */
const image = (cells: number, rows = 1): HTMLImageElement =>
  ({width: cells * 32, height: rows * 32, src: 'data:,'}) as HTMLImageElement;

const open = (
  props: Partial<React.ComponentProps<typeof AddFramesDialog>> = {},
) =>
  render(
    <AddFramesDialog
      sheets={{'coinSpin.png': SHEET}}
      images={{'coinSpin.png': image(3)}}
      onAdd={vi.fn()}
      onCancel={vi.fn()}
      {...props}
    />,
  );

const cell = (n: number) =>
  screen.getByRole('button', {name: new RegExp(`^Cell ${n},`)});

describe('AddFramesDialog', () => {
  it('offers every cell of the sheet, all of them taken to start with', () => {
    open();

    expect(cell(1)).toHaveAttribute('aria-pressed', 'true');
    expect(cell(3)).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('button', {name: /^Cell 4,/})).toBeNull();
    expect(screen.getByRole('button', {name: 'Add 3 frames'})).toBeEnabled();
  });

  it('says where each cell lands in the animation', () => {
    open();

    expect(cell(2)).toHaveAccessibleName('Cell 2, frame 2');

    fireEvent.click(cell(1));

    // Dropping the first cell moves the rest up; the one dropped says so.
    expect(cell(1)).toHaveAccessibleName('Cell 1, not used');
    expect(cell(2)).toHaveAccessibleName('Cell 2, frame 1');
  });

  it('adds the chosen cells in reading order, whatever order they were picked', () => {
    const onAdd = vi.fn();
    open({onAdd});

    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    fireEvent.click(cell(3));
    fireEvent.click(cell(1));
    fireEvent.click(screen.getByRole('button', {name: 'Add 2 frames'}));

    expect(onAdd).toHaveBeenCalledWith('coinSpin.png', [
      {x: 0, y: 0, width: 32, height: 32},
      {x: 64, y: 0, width: 32, height: 32},
    ]);
  });

  it('counts one frame as one frame', () => {
    open();

    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    expect(screen.getByRole('button', {name: /^Add/})).toBeDisabled();

    fireEvent.click(cell(2));
    expect(screen.getByRole('button', {name: 'Add 1 frame'})).toBeEnabled();
  });

  it('lets a project with several sheets choose between them', () => {
    const onAdd = vi.fn();
    open({
      sheets: {'coinSpin.png': SHEET, 'playerWalk.png': SHEET},
      images: {'coinSpin.png': image(3), 'playerWalk.png': image(2)},
      onAdd,
    });

    fireEvent.click(screen.getByRole('button', {name: /playerWalk\.png/}));

    // Its two cells, not the coin's three.
    expect(screen.queryByRole('button', {name: /^Cell 3,/})).toBeNull();
    fireEvent.click(screen.getByRole('button', {name: 'Add 2 frames'}));
    expect(onAdd.mock.calls[0][0]).toBe('playerWalk.png');
  });

  it('says so when the project holds no spritesheet', () => {
    open({sheets: {}, images: {}});

    expect(screen.getByText(/No spritesheets yet/)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /^Add/})).toBeDisabled();
  });

  it('ignores a sheet whose image has not decoded', () => {
    // Nothing to look at is nothing to choose.
    open({sheets: {'coinSpin.png': SHEET}, images: {}});

    expect(screen.getByText(/No spritesheets yet/)).toBeInTheDocument();
  });
});
