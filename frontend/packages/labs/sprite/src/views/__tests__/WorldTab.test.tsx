import {fireEvent, render, screen} from '@testing-library/react';
import {type ComponentProps} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';

import WorldTab, {
  cellAtPoint,
  cellSide,
  paletteItemsPerColumn,
} from '../WorldTab';

const animationList = {
  orderedKeys: ['k1', 'k2'],
  propsByKey: {
    k1: {name: 'Stone', categories: ['blocks'], sourceUrl: 'stone.png'},
    k2: {name: 'Hero', categories: [], sourceUrl: 'hero.png'},
  },
};
vi.mock('../../redux/store', () => ({
  useAppSelector: (select: (state: unknown) => unknown) =>
    select({animationList}),
  useAppDispatch: () => vi.fn(),
}));

// The grid's box, for turning pointer positions into cells: 10 cells of 50px
// inside a 1px border at (100, 100).
const GRID_RECT = {left: 100, top: 100, width: 502, height: 502, border: 1};

beforeAll(() => {
  // jsdom has no ResizeObserver; the grid stays at its unmeasured size.
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      disconnect() {}
    },
  );
  // jsdom has no PointerEvent: without it fireEvent's pointer events carry
  // no button or coordinates.
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

function renderTab({
  onPaintCell = vi.fn(),
  onSelect = vi.fn(),
  ...props
}: Partial<ComponentProps<typeof WorldTab>> = {}) {
  const utils = render(
    <WorldTab
      sceneSize={10}
      selected={null}
      emptyMessage="Nothing yet."
      {...props}
      onPaintCell={onPaintCell}
      onSelect={onSelect}
    />,
  );
  // jsdom lays nothing out: the grid's box is given, with no border.
  const grid = screen.getByRole('grid');
  vi.spyOn(grid, 'getBoundingClientRect').mockReturnValue({
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
  it('sizes a cell from the box less its border', () => {
    expect(cellSide(GRID_RECT, 10)).toBe(50);
    expect(cellSide({...GRID_RECT, width: 500, border: 0}, 10)).toBe(50);
  });

  it('maps a point inside the border to its cell, and outside to null', () => {
    expect(cellAtPoint(GRID_RECT, 10, 101, 101)).toEqual({row: 0, col: 0});
    expect(
      cellAtPoint(GRID_RECT, 10, 100 + 1 + 50 * 4 + 25, 100 + 1 + 50 * 7),
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
      screen.getAllByRole('radio').map(radio => radio.textContent),
    ).toEqual(['Stone, block', 'Hero, sprite', 'Erase']);
    expect(screen.getByRole('radiogroup').style.gridTemplateRows).toBe(
      'repeat(3, 64px)',
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

  it('drops nothing on a cell that already holds the item, and says so', () => {
    const {onPaintCell, onSelect} = renderTab({
      world: {grid: [[{image: 'Stone', kind: 'block'}]]},
    });
    const stone = screen.getByRole('radio', {name: /Stone, block/});
    fireEvent.pointerDown(stone, {
      pointerId: 1,
      button: 0,
      clientX: 20,
      clientY: 20,
    });
    fireEvent.pointerMove(stone, {pointerId: 1, clientX: 60, clientY: 60});
    fireEvent.pointerUp(stone, {pointerId: 1, clientX: 110, clientY: 110});
    expect(onPaintCell).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith({image: 'Stone', kind: 'block'});
    expect(screen.getByText('Stone is already there.')).toBeTruthy();
  });

  it('paints along a stroke from a cell, not under a drag from the palette', () => {
    const stone = {image: 'Stone', kind: 'block' as const};
    const {onPaintCell} = renderTab({selected: stone});
    const cells = screen.getAllByRole('gridcell');
    // A drag from the palette crosses cells with the button down.
    const item = screen.getByRole('radio', {name: /Stone, block/});
    fireEvent.pointerDown(item, {
      pointerId: 1,
      button: 0,
      clientX: 20,
      clientY: 20,
    });
    fireEvent.pointerMove(item, {pointerId: 1, clientX: 60, clientY: 60});
    fireEvent.pointerEnter(cells[3], {pointerId: 1, buttons: 1});
    expect(onPaintCell).not.toHaveBeenCalled();
    fireEvent.pointerUp(item, {pointerId: 1, clientX: 60, clientY: 60});
    // A stroke that began on a cell paints the cells it enters, until the
    // release.
    fireEvent.pointerDown(cells[0], {pointerId: 1, button: 0, buttons: 1});
    fireEvent.pointerEnter(cells[1], {pointerId: 1, buttons: 1});
    expect(onPaintCell).toHaveBeenCalledTimes(2);
    expect(onPaintCell).toHaveBeenLastCalledWith(0, 1, stone);
    fireEvent.pointerUp(window, {pointerId: 1});
    fireEvent.pointerEnter(cells[2], {pointerId: 1, buttons: 1});
    expect(onPaintCell).toHaveBeenCalledTimes(2);
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

  describe('placing one thing', () => {
    const hero = {image: 'Hero', kind: 'sprite' as const};
    const stone = {image: 'Stone', kind: 'block' as const};
    const dragHero = (clientX: number, clientY: number) => {
      const item = screen.getByRole('radio', {name: /Hero, sprite/});
      fireEvent.pointerDown(item, {
        pointerId: 1,
        button: 0,
        clientX: 20,
        clientY: 20,
      });
      fireEvent.pointerMove(item, {pointerId: 1, clientX: 60, clientY: 60});
      fireEvent.pointerUp(item, {pointerId: 1, clientX, clientY});
    };

    it('offers no Erase and moves the item on a drop, refusing a taken cell', () => {
      const onMoveCell = vi.fn();
      const {onPaintCell} = renderTab({
        world: {grid: [[hero, stone]]},
        only: 'Hero',
        onMoveCell,
      });
      expect(screen.queryByRole('radio', {name: /Erase/})).toBeNull();
      dragHero(100 + 1 + 50 + 10, 110);
      expect(onMoveCell).not.toHaveBeenCalled();
      expect(screen.getByText('That square is taken.')).toBeTruthy();
      dragHero(100 + 1 + 50 * 4 + 10, 100 + 1 + 50 * 2 + 10);
      expect(onMoveCell).toHaveBeenCalledWith(2, 4, hero);
      expect(onPaintCell).not.toHaveBeenCalled();
    });

    it('places by keyboard once, not along a held arrow stroke', () => {
      const onMoveCell = vi.fn();
      const {onPaintCell} = renderTab({
        world: {grid: [[stone]]},
        only: 'Hero',
        onMoveCell,
        selected: hero,
      });
      const cells = screen.getAllByRole('gridcell');
      fireEvent.keyDown(cells[0], {key: 'Enter'});
      expect(onMoveCell).not.toHaveBeenCalled();
      expect(screen.getByText('That square is taken.')).toBeTruthy();
      fireEvent.keyUp(cells[0], {key: 'Enter'});
      fireEvent.keyDown(cells[0], {key: 'ArrowRight'});
      fireEvent.keyDown(cells[1], {key: 'Enter'});
      expect(onMoveCell).toHaveBeenCalledWith(0, 1, hero);
      // Enter still held: the arrow moves the cursor and nothing else.
      fireEvent.keyDown(cells[1], {key: 'ArrowRight'});
      expect(onMoveCell).toHaveBeenCalledTimes(1);
      expect(onPaintCell).not.toHaveBeenCalled();
    });

    it('lets Delete remove any image the palette offers', () => {
      const {onPaintCell} = renderTab({
        world: {grid: [[hero]]},
        onMoveCell: vi.fn(),
      });
      fireEvent.keyDown(screen.getAllByRole('gridcell')[0], {key: 'Delete'});
      expect(onPaintCell).toHaveBeenCalledWith(0, 0, null);
    });

    it('keeps a one-cell palette shape with nothing to place', () => {
      const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderTab({only: 'Nothing', onMoveCell: vi.fn()});
      expect(screen.queryAllByRole('radio')).toHaveLength(0);
      expect(screen.getByText('Nothing yet.')).toBeTruthy();
      expect(errors.mock.calls.flat().join(' ')).not.toMatch(/NaN/);
      errors.mockRestore();
    });
  });
});
