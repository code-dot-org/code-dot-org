// Picking which cell of a spritesheet a frame draws.
//
// It was a canvas with a click handler: no focus, no keys, nothing for a screen
// reader. What is checked here is that it is now operable without a mouse —
// one tab stop, arrows through the grid — and still says which cell is taken.

import {fireEvent, render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';

import type {SheetFile} from '../../appearance/sheetFile';
import {CellPicker} from '../CellPicker';

const SHEET: SheetFile = {type: 'sheet', cell: {width: 32, height: 32}};

/** An image of `columns` × `rows` cells, as far as the picker can tell. */
const image = (columns: number, rows = 1): HTMLImageElement =>
  ({width: columns * 32, height: rows * 32}) as HTMLImageElement;

const open = (props: Partial<React.ComponentProps<typeof CellPicker>> = {}) =>
  render(
    <CellPicker
      image={image(4)}
      sheet={SHEET}
      selected={{x: 32, y: 0, width: 32, height: 32}}
      disabled={false}
      onPick={vi.fn()}
      {...props}
    />,
  );

const cell = (n: number) => screen.getByRole('radio', {name: `Cell ${n}`});

describe('CellPicker', () => {
  it('offers each cell as a radio, saying which one is taken', () => {
    open();

    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(cell(2)).toBeChecked();
    expect(cell(1)).not.toBeChecked();
  });

  it('is one tab stop — the taken cell', () => {
    open();

    expect(cell(2)).toHaveAttribute('tabindex', '0');
    expect(cell(1)).toHaveAttribute('tabindex', '-1');
    expect(cell(4)).toHaveAttribute('tabindex', '-1');
  });

  it('starts at the first cell when the frame draws none of them', () => {
    open({selected: undefined});

    expect(cell(1)).toHaveAttribute('tabindex', '0');
    expect(screen.queryByRole('radio', {checked: true})).toBeNull();
  });

  it('takes a cell on a click', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.click(cell(3));

    expect(onPick).toHaveBeenCalledWith({x: 64, y: 0, width: 32, height: 32});
  });

  it('moves along the row with the arrow keys', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.keyDown(cell(2), {key: 'ArrowRight'});
    expect(onPick).toHaveBeenLastCalledWith({
      x: 64,
      y: 0,
      width: 32,
      height: 32,
    });

    fireEvent.keyDown(cell(2), {key: 'ArrowLeft'});
    expect(onPick).toHaveBeenLastCalledWith({
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    });
  });

  it('moves a row at a time through a grid', () => {
    const onPick = vi.fn();
    // Three across, two down: below cell 2 is cell 5.
    open({image: image(3, 2), onPick});

    fireEvent.keyDown(cell(2), {key: 'ArrowDown'});

    expect(onPick).toHaveBeenLastCalledWith({
      x: 32,
      y: 32,
      width: 32,
      height: 32,
    });
  });

  it('stops at the edges rather than sliding around them', () => {
    const onPick = vi.fn();
    open({selected: {x: 0, y: 0, width: 32, height: 32}, onPick});

    fireEvent.keyDown(cell(1), {key: 'ArrowLeft'});
    fireEvent.keyDown(cell(1), {key: 'ArrowUp'});

    expect(onPick).not.toHaveBeenCalled();
  });

  it('jumps to the ends with Home and End', () => {
    const onPick = vi.fn();
    open({onPick});

    fireEvent.keyDown(cell(2), {key: 'End'});
    expect(onPick).toHaveBeenLastCalledWith({
      x: 96,
      y: 0,
      width: 32,
      height: 32,
    });

    fireEvent.keyDown(cell(2), {key: 'Home'});
    expect(onPick).toHaveBeenLastCalledWith({
      x: 0,
      y: 0,
      width: 32,
      height: 32,
    });
  });

  it('does nothing at all when the workspace is read-only', () => {
    const onPick = vi.fn();
    open({disabled: true, onPick});

    fireEvent.keyDown(cell(2), {key: 'ArrowRight'});
    fireEvent.click(cell(3));

    expect(onPick).not.toHaveBeenCalled();
    expect(cell(1)).toBeDisabled();
  });

  it('draws nothing before its image has arrived', () => {
    open({image: undefined});

    expect(screen.queryByRole('radiogroup')).toBeNull();
  });
});
