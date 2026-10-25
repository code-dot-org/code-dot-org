// A Screen's grid layout (specs/DOCKING_PLAN.md, step 1).

import {describe, expect, it} from 'vitest';

import {
  dividers,
  dock,
  dockedIds,
  fixedSideOf,
  isLayout,
  layoutBoxes,
  resize,
  splitAt,
  undock,
  type LayoutNode,
} from '../layout';

/** A HUD bar 48 tall over the game, in a 320 by 480 screen. */
const HUD: LayoutNode = {
  split: 'down',
  fixed: 'first',
  size: 48,
  first: {dock: 'hud'},
  second: {dock: 'game'},
};

describe('the boxes a layout gives', () => {
  it('fills the screen with one docked placement', () => {
    expect(layoutBoxes({dock: 'game'}, 320, 480)).toEqual(
      new Map([['game', {x: 0, y: 0, width: 320, height: 480}]]),
    );
  });

  it('keeps a fixed side fixed, and gives the other the rest', () => {
    const boxes = layoutBoxes(HUD, 320, 480);
    expect(boxes.get('hud')).toEqual({x: 0, y: 0, width: 320, height: 48});
    expect(boxes.get('game')).toEqual({x: 0, y: 48, width: 320, height: 432});
    // …in a taller screen, the bar is the same bar.
    expect(layoutBoxes(HUD, 320, 800).get('hud')!.height).toBe(48);
  });

  it('fixes the second side as well as the first, across as well as down', () => {
    const side: LayoutNode = {
      split: 'across',
      fixed: 'second',
      size: 100,
      first: {dock: 'game'},
      second: {dock: 'panel'},
    };
    const boxes = layoutBoxes(side, 320, 480);
    expect(boxes.get('game')).toEqual({x: 0, y: 0, width: 220, height: 480});
    expect(boxes.get('panel')).toEqual({x: 220, y: 0, width: 100, height: 480});
  });

  it('clamps a fixed side to the region it is in', () => {
    const boxes = layoutBoxes({...HUD, size: 900}, 320, 480);
    expect(boxes.get('hud')!.height).toBe(480);
    expect(boxes.get('game')!.height).toBe(0);
  });

  it('closes over a placement that is not there', () => {
    const boxes = layoutBoxes(HUD, 320, 480, id => id !== 'hud');
    expect([...boxes.keys()]).toEqual(['game']);
    expect(boxes.get('game')).toEqual({x: 0, y: 0, width: 320, height: 480});
  });

  it('is nothing for no layout', () => {
    expect(layoutBoxes(undefined, 320, 480).size).toBe(0);
  });
});

describe('a stored layout', () => {
  it('is read all the way down, or not at all', () => {
    expect(isLayout(HUD)).toBe(true);
    expect(isLayout({...HUD, fixed: 'middle'})).toBe(false);
    expect(isLayout({...HUD, second: {dock: 3}})).toBe(false);
    expect(isLayout(undefined)).toBe(false);
    expect(dockedIds(HUD)).toEqual(['hud', 'game']);
  });
});

describe('docking', () => {
  it('fills the screen with the first, whatever side it was dropped on', () => {
    expect(dock(undefined, 'game', undefined, 'top', 40)).toEqual({
      dock: 'game',
    });
  });

  it('puts one on an edge of the screen, the rest filling the remainder', () => {
    expect(dock({dock: 'game'}, 'hud', undefined, 'top', 48)).toEqual(HUD);
    expect(dock({dock: 'game'}, 'bar', undefined, 'right', 60)).toEqual({
      split: 'across',
      fixed: 'second',
      size: 60,
      first: {dock: 'game'},
      second: {dock: 'bar'},
    });
  });

  it('puts one beside another docked placement, splitting that region', () => {
    const next = dock(HUD, 'score', 'hud', 'left', 100);
    expect(next).toEqual({
      ...HUD,
      first: {
        split: 'across',
        fixed: 'first',
        size: 100,
        first: {dock: 'score'},
        second: {dock: 'hud'},
      },
    });
    expect(layoutBoxes(next, 320, 480).get('score')).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 48,
    });
  });

  it('moves one already docked rather than docking it twice', () => {
    const moved = dock(HUD, 'hud', undefined, 'bottom', 48);
    expect(dockedIds(moved)).toEqual(['game', 'hud']);
  });

  it('undocks, the split closing over the hole', () => {
    expect(undock(HUD, 'hud')).toEqual({dock: 'game'});
    expect(undock({dock: 'game'}, 'game')).toBeUndefined();
    expect(undock(HUD, 'nobody')).toBe(HUD);
  });
});

describe('a divider', () => {
  it('is where the fixed side ends, and moves with its size', () => {
    expect(dividers(HUD, 320, 480)).toEqual([
      {
        path: [],
        split: 'down',
        at: 48,
        box: {x: 0, y: 0, width: 320, height: 480},
      },
    ]);
    const taller = resize(HUD, [], 64)!;
    expect(splitAt(taller, [])!.size).toBe(64);
    expect(dividers(taller, 320, 480)[0].at).toBe(64);
  });

  it('is found by its path through nested splits', () => {
    const nested = dock(HUD, 'score', 'hud', 'left', 100);
    const inner = dividers(nested, 320, 480).find(
      one => one.path.length === 1,
    )!;
    expect(inner).toMatchObject({path: ['first'], split: 'across', at: 100});
    expect(splitAt(resize(nested, ['first'], 120), ['first'])!.size).toBe(120);
  });
});

describe('the fixed side a placement is', () => {
  it('is found with its split, and is nothing for one that fills', () => {
    expect(fixedSideOf(HUD, 'hud')).toEqual({
      path: [],
      split: 'down',
      size: 48,
    });
    expect(fixedSideOf(HUD, 'game')).toBeUndefined();
    const nested = dock(HUD, 'score', 'hud', 'left', 100);
    expect(fixedSideOf(nested, 'score')).toEqual({
      path: ['first'],
      split: 'across',
      size: 100,
    });
  });
});
