import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';

import WorldTab, {
  cellAtPoint,
  paletteItemsPerColumn,
} from '@cdo/apps/p5lab/spritelab/lab2/views/WorldTab';

const animationList = {
  orderedKeys: ['k1', 'k2'],
  propsByKey: {
    k1: {name: 'Stone', categories: ['blocks'], sourceUrl: 'stone.png'},
    k2: {name: 'Hero', categories: [], sourceUrl: 'hero.png'},
  },
};
jest.mock('@cdo/apps/util/reduxHooks', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({animationList}),
  useAppDispatch: () => jest.fn(),
}));

// The grid's box, for turning pointer positions into cells: 10 cells of 50px
// inside a 1px border at (100, 100).
const GRID_RECT = {left: 100, top: 100, width: 502, height: 502};

beforeAll(() => {
  // jsdom has no ResizeObserver; the tab measures its room with one.
  (global as unknown as {ResizeObserver: unknown}).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };
  // Nor PointerEvent: without it fireEvent's pointer events carry no
  // button or coordinates.
  (window as unknown as {PointerEvent: unknown}).PointerEvent = class extends (
    MouseEvent
  ) {
    pointerId: number;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 0;
    }
  };
});

function renderTab(onPaintCell = jest.fn(), onSelect = jest.fn()) {
  const utils = render(
    <WorldTab
      sceneSize={10}
      onPaintCell={onPaintCell}
      selected={null}
      onSelect={onSelect}
    />
  );
  const grid = screen.getByRole('grid');
  jest.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
    ...GRID_RECT,
    right: GRID_RECT.left + GRID_RECT.width,
    bottom: GRID_RECT.top + GRID_RECT.height,
    x: GRID_RECT.left,
    y: GRID_RECT.top,
    toJSON: () => ({}),
  });
  return {...utils, onPaintCell, onSelect};
}

describe('cellAtPoint', () => {
  it('maps a point inside the border to its cell, and outside to null', () => {
    expect(cellAtPoint(GRID_RECT, 10, 101, 101)).toEqual({row: 0, col: 0});
    expect(
      cellAtPoint(GRID_RECT, 10, 100 + 1 + 50 * 4 + 25, 100 + 1 + 50 * 7)
    ).toEqual({row: 7, col: 4});
    expect(cellAtPoint(GRID_RECT, 10, 601, 601)).toEqual({row: 9, col: 9});
    expect(cellAtPoint(GRID_RECT, 10, 99, 300)).toBeNull();
    expect(cellAtPoint(GRID_RECT, 10, 300, 602)).toBeNull();
  });
});

describe('paletteItemsPerColumn', () => {
  it('fits 64px items with 8px gaps into the height, never fewer than one', () => {
    expect(paletteItemsPerColumn(721)).toBe(10);
    expect(paletteItemsPerColumn(136)).toBe(2);
    expect(paletteItemsPerColumn(135)).toBe(1);
    expect(paletteItemsPerColumn(10)).toBe(1);
  });
});

describe('WorldTab palette', () => {
  it('lists the placeable images with Erase last, in one column', () => {
    renderTab();
    expect(
      screen.getAllByRole('radio').map(radio => radio.textContent)
    ).toEqual(['Stone, block', 'Hero, sprite', 'Erase']);
    expect(screen.getByRole('radiogroup').style.gridTemplateRows).toBe(
      'repeat(3, 64px)'
    );
  });

  it('drops a dragged item onto the cell under the pointer', () => {
    const {onPaintCell, onSelect} = renderTab();
    const stone = screen.getByRole('radio', {name: /Stone, block/});
    fireEvent.pointerDown(stone, {
      pointerId: 1,
      button: 0,
      clientX: 20,
      clientY: 20,
    });
    fireEvent.pointerMove(stone, {pointerId: 1, clientX: 40, clientY: 40});
    fireEvent.pointerUp(stone, {
      pointerId: 1,
      clientX: 100 + 1 + 50 * 2 + 10,
      clientY: 100 + 1 + 50 * 3 + 10,
    });
    expect(onPaintCell).toHaveBeenCalledWith(3, 2, {
      image: 'Stone',
      kind: 'block',
    });
    // The drop chooses the item once; the release's click adds nothing.
    fireEvent.click(stone);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith({image: 'Stone', kind: 'block'});
  });

  it('treats a press that barely moves as a tap, not a drop', () => {
    const {onPaintCell} = renderTab();
    const stone = screen.getByRole('radio', {name: /Stone, block/});
    fireEvent.pointerDown(stone, {
      pointerId: 1,
      button: 0,
      clientX: 20,
      clientY: 20,
    });
    fireEvent.pointerMove(stone, {pointerId: 1, clientX: 22, clientY: 23});
    fireEvent.pointerUp(stone, {pointerId: 1, clientX: 300, clientY: 300});
    expect(onPaintCell).not.toHaveBeenCalled();
  });

  it('drops nothing when released off the grid', () => {
    const {onPaintCell} = renderTab();
    const stone = screen.getByRole('radio', {name: /Stone, block/});
    fireEvent.pointerDown(stone, {
      pointerId: 1,
      button: 0,
      clientX: 20,
      clientY: 20,
    });
    fireEvent.pointerMove(stone, {pointerId: 1, clientX: 60, clientY: 60});
    fireEvent.pointerUp(stone, {pointerId: 1, clientX: 60, clientY: 60});
    expect(onPaintCell).not.toHaveBeenCalled();
  });

  it('walks the column with Down and Up, choosing as it goes', () => {
    const {onSelect} = renderTab();
    const stone = screen.getByRole('radio', {name: /Stone, block/});
    stone.focus();
    fireEvent.keyDown(stone, {key: 'ArrowDown'});
    expect(onSelect).toHaveBeenLastCalledWith({image: 'Hero', kind: 'sprite'});
    fireEvent.keyDown(screen.getByRole('radio', {name: /Hero, sprite/}), {
      key: 'ArrowDown',
    });
    expect(onSelect).toHaveBeenLastCalledWith('erase');
  });
});
