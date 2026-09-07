// The map stage's arithmetic, asked the questions the handlers ask.
//
// None of this could be tested while it lived inside `MapStage`: jsdom gives
// a canvas no size, so the camera never initialised and every gesture
// returned before doing anything. Each function here is a fact about a
// document, a camera and a point, and each test is one of those facts —
// most of them the one that was easy to get wrong and invisible when it was.

import {describe, expect, it} from 'vitest';

import type {Placement, Transform, View} from '../mapModel';
import {
  drawnSize,
  fitView,
  hitTest,
  MAX_SCALE,
  MIN_HIT_SIZE,
  MIN_SCALE,
  nextSelection,
  panIntoView,
  screenToWorld,
  snapToTile,
  steppedBy,
  toLocalFrame,
  worldToScreen,
  zoomToward,
} from '../stageGeometry';

const TILE = {width: 32, height: 32};

/** A placement at a point, with whatever else the properties say. */
const at = (
  id: string,
  x: number,
  y: number,
  more: Record<string, unknown> = {},
  type = 'actors/coin',
): Placement => ({
  type,
  id,
  properties: {positional: {position: {x, y}, ...more}},
});

describe('fitView', () => {
  it('centers the map with a rim of outside round it', () => {
    // 320 wide into 800 by 600: the height is the tighter fit, 600/320, and
    // the padding takes 8% off that. What is left over is split evenly.
    const view = fitView(800, 600, {w: 320, h: 320});
    expect(view.scale).toBeCloseTo((600 / 320) * 0.92, 6);
    expect(view.x).toBeCloseTo((800 - 320 * view.scale) / 2, 6);
    expect(view.y).toBeCloseTo((600 - 320 * view.scale) / 2, 6);
  });

  it('never zooms past the limits, however small or large the map', () => {
    expect(fitView(800, 600, {w: 10, h: 10}).scale).toBe(MAX_SCALE);
    expect(fitView(800, 600, {w: 100_000, h: 100_000}).scale).toBe(MIN_SCALE);
  });
});

describe('the camera', () => {
  const view: View = {scale: 2, x: 100, y: 50};

  it('maps screen to world and back', () => {
    const world = screenToWorld(view, 300, 250);
    expect(world).toEqual({x: 100, y: 100});
    expect(worldToScreen(view, world)).toEqual({x: 300, y: 250});
  });

  it('zooms toward the cursor, keeping what is under it where it is', () => {
    // THE PIN. A zoom that kept the origin fixed would slide whatever you were
    // looking at out from under the pointer. So: the world point under the
    // cursor before is the world point under it after, at any zoom.
    const before = screenToWorld(view, 640, 480);
    const zoomed = zoomToward(view, 640, 480, -300);
    expect(zoomed.scale).toBeGreaterThan(view.scale);
    const after = screenToWorld(zoomed, 640, 480);
    expect(after.x).toBeCloseTo(before.x, 9);
    expect(after.y).toBeCloseTo(before.y, 9);
  });

  it('stops at the zoom limits', () => {
    expect(zoomToward(view, 0, 0, -1e6).scale).toBe(MAX_SCALE);
    expect(zoomToward(view, 0, 0, 1e6).scale).toBe(MIN_SCALE);
  });
});

describe('snapToTile', () => {
  it('lands on the center of the cell, not its corner', () => {
    // An actor's position IS its center, so a snapped actor sits in one cell
    // rather than straddling four.
    expect(snapToTile({x: 33, y: 63}, TILE, false)).toEqual({x: 48, y: 48});
    expect(snapToTile({x: 0, y: 0}, TILE, false)).toEqual({x: 16, y: 16});
  });

  it('respects a tile that is not square', () => {
    expect(snapToTile({x: 70, y: 70}, {width: 64, height: 16}, false)).toEqual({
      x: 96,
      y: 72,
    });
  });

  it('is a whole pixel when freed', () => {
    expect(snapToTile({x: 33.4, y: 63.6}, TILE, true)).toEqual({x: 33, y: 64});
  });
});

describe('steppedBy', () => {
  it('moves a whole tile and stays on the grid', () => {
    expect(steppedBy({x: 48, y: 48}, TILE, 1, 0, false)).toEqual({
      x: 80,
      y: 48,
    });
    expect(steppedBy({x: 48, y: 48}, TILE, 0, -1, false)).toEqual({
      x: 48,
      y: 16,
    });
  });

  it('brings an off-grid actor onto it with its first step', () => {
    // Snapped after the move, not before: a nudge is a grid gesture.
    expect(steppedBy({x: 50, y: 41}, TILE, 1, 0, false)).toEqual({
      x: 80,
      y: 48,
    });
  });

  it('is one pixel when freed, from wherever it was', () => {
    expect(steppedBy({x: 50, y: 41}, TILE, -1, 0, true)).toEqual({
      x: 49,
      y: 41,
    });
  });
});

describe('drawnSize', () => {
  it('is the kind’s declared size, or a tile when it declares none', () => {
    const sizes = {'actors/bar': {width: 64, height: 8}};
    expect(drawnSize(sizes, 'actors/bar')).toEqual({width: 64, height: 8});
    expect(drawnSize(sizes, 'actors/coin')).toEqual({width: 32, height: 32});
    expect(drawnSize(undefined, 'actors/coin')).toEqual({
      width: 32,
      height: 32,
    });
  });
});

describe('toLocalFrame', () => {
  const base: Transform = {
    pos: {x: 100, y: 100},
    scale: {x: 1, y: 1},
    rotation: 0,
    skew: 0,
  };

  it('is the offset from the actor when it is drawn plainly', () => {
    expect(toLocalFrame({x: 110, y: 95}, base)).toEqual({x: 10, y: -5});
  });

  it('undoes a rotation', () => {
    // A quarter turn: what is to the actor's right on screen was above it in
    // its own frame.
    const local = toLocalFrame({x: 110, y: 100}, {...base, rotation: 90});
    expect(local.x).toBeCloseTo(0, 9);
    expect(local.y).toBeCloseTo(-10, 9);
  });

  it('undoes a scale', () => {
    const local = toLocalFrame(
      {x: 120, y: 100},
      {...base, scale: {x: 2, y: 1}},
    );
    expect(local).toEqual({x: 10, y: 0});
  });

  it('undoes a skew, so the frame follows the sheared shape', () => {
    // A 45° vertical shear draws the point (10, 0) of the sprite at (10, 10)
    // on the canvas. Asking about (110, 110) must therefore answer (10, 0).
    const local = toLocalFrame({x: 110, y: 110}, {...base, skew: 45});
    expect(local.x).toBeCloseTo(10, 9);
    expect(local.y).toBeCloseTo(0, 9);
  });

  it('does not divide by a zero scale', () => {
    const local = toLocalFrame(
      {x: 110, y: 100},
      {...base, scale: {x: 0, y: 0}},
    );
    expect(Number.isFinite(local.x)).toBe(true);
  });
});

describe('hitTest', () => {
  it('finds the actor whose box the point is in', () => {
    const actors = [at('a', 48, 48), at('b', 144, 48)];
    expect(hitTest(actors, {x: 50, y: 40}, undefined)?.id).toBe('a');
    expect(hitTest(actors, {x: 140, y: 60}, undefined)?.id).toBe('b');
    expect(hitTest(actors, {x: 96, y: 48}, undefined)).toBeUndefined();
  });

  it('prefers the one drawn last where two overlap', () => {
    // Actors draw in array order, so the last is on top and is the one a
    // click on the overlap should grab.
    const actors = [at('under', 48, 48), at('over', 56, 48)];
    expect(hitTest(actors, {x: 52, y: 48}, undefined)?.id).toBe('over');
  });

  it('reaches a little further than a thin actor is drawn', () => {
    // A bar eight pixels tall is an eight-pixel target otherwise. The reach
    // is MIN_HIT_SIZE; the drawn size is still eight.
    const sizes = {'actors/bar': {width: 64, height: 8}};
    const actors = [at('bar', 100, 100, {}, 'actors/bar')];
    const reach = MIN_HIT_SIZE / 2;
    expect(hitTest(actors, {x: 100, y: 100 + reach - 0.5}, sizes)?.id).toBe(
      'bar',
    );
    expect(
      hitTest(actors, {x: 100, y: 100 + reach + 0.5}, sizes),
    ).toBeUndefined();
  });

  it('follows a skewed sprite rather than the box it would sit in unskewed', () => {
    // THE ONE THAT MOTIVATED THE INVERSION. Sheared 45° down to the right,
    // the sprite's top-right corner is drawn well below where an unskewed
    // box would put it. A point there is inside the sprite and outside the
    // naive box; a point at the naive box's top-right is outside the sprite.
    const actors = [at('s', 100, 100, {skew: 45})];
    expect(hitTest(actors, {x: 114, y: 114 + 14}, undefined)?.id).toBe('s');
    expect(hitTest(actors, {x: 114, y: 100 - 14}, undefined)).toBeUndefined();
  });

  it('follows a rotated sprite that is not square', () => {
    // A 64-by-8 bar turned upright: hittable up and down, not across.
    const sizes = {'actors/bar': {width: 64, height: 8}};
    const actors = [at('bar', 100, 100, {rotation: 90}, 'actors/bar')];
    expect(hitTest(actors, {x: 100, y: 128}, sizes)?.id).toBe('bar');
    expect(hitTest(actors, {x: 128, y: 100}, sizes)).toBeUndefined();
  });

  it('cannot hit an actor with no position', () => {
    const ghost: Placement = {type: 'actors/coin', id: 'g', properties: {}};
    expect(hitTest([ghost], {x: 0, y: 0}, undefined)).toBeUndefined();
  });
});

describe('panIntoView', () => {
  const view: View = {scale: 1, x: 0, y: 0};
  const size = {w: 800, h: 600};

  it('leaves a camera alone that already shows the point comfortably', () => {
    expect(panIntoView(view, size, {x: 400, y: 300})).toBeUndefined();
    // Just inside the 15% margin still counts.
    expect(panIntoView(view, size, {x: 121, y: 91})).toBeUndefined();
  });

  it('centers a point in the margin or off the pane, keeping the zoom', () => {
    // On the last pixel is technically on screen and practically lost.
    const moved = panIntoView({...view, scale: 2}, size, {x: 1000, y: 10});
    expect(moved?.scale).toBe(2);
    expect(worldToScreen(moved!, {x: 1000, y: 10})).toEqual({x: 400, y: 300});
  });

  it('does nothing for a pane with no size yet', () => {
    expect(panIntoView(view, {w: 0, h: 0}, {x: 5000, y: 5000})).toBeUndefined();
  });
});

describe('nextSelection', () => {
  const actors = [
    at('a', 0, 0),
    {type: 'actors/coin', id: 'nowhere', properties: {}},
    at('b', 0, 0),
    at('c', 0, 0),
  ];

  it('walks forward and back, wrapping round', () => {
    expect(nextSelection(actors, 'a', 1)?.id).toBe('b');
    expect(nextSelection(actors, 'c', 1)?.id).toBe('a');
    expect(nextSelection(actors, 'a', -1)?.id).toBe('c');
  });

  it('starts at either end from nothing', () => {
    expect(nextSelection(actors, null, 1)?.id).toBe('a');
    expect(nextSelection(actors, null, -1)?.id).toBe('c');
  });

  it('never lands on an actor that is not on the canvas', () => {
    // `nowhere` has no position and is skipped in both directions.
    expect(nextSelection(actors, 'a', 1)?.id).toBe('b');
    expect(nextSelection(actors, 'b', -1)?.id).toBe('a');
  });

  it('is nothing for an empty map', () => {
    expect(nextSelection([], null, 1)).toBeUndefined();
  });
});
