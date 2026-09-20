// Where a placement sits when the window is not the shape the map was drawn at
// (specs/ANCHORS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {anchored, anchorPoint, ANCHORS, isAnchor} from '../core/anchors';
import {Vector} from '../core/Vector';

const at = (x: number, y: number) => new Vector(x, y);

describe('anchorPoint', () => {
  it('names the four corners, the four edges and the middle', () => {
    const size = at(200, 100);

    expect(anchorPoint(size, 'top left')).toEqual(at(0, 0));
    expect(anchorPoint(size, 'top right')).toEqual(at(200, 0));
    expect(anchorPoint(size, 'bottom left')).toEqual(at(0, 100));
    expect(anchorPoint(size, 'bottom right')).toEqual(at(200, 100));
    expect(anchorPoint(size, 'top')).toEqual(at(100, 0));
    expect(anchorPoint(size, 'center')).toEqual(at(100, 50));
  });
});

describe('anchored', () => {
  it('keeps a thing the same distance from its corner', () => {
    // Sixteen in from the bottom right of a 200x100 map, and still sixteen in
    // from the bottom right of a 300x400 window.
    const where = anchored(
      at(184, 84),
      'bottom right',
      at(200, 100),
      at(300, 400),
    );

    expect(where).toEqual(at(284, 384));
  });

  it('moves nothing when the window is the map’s own shape', () => {
    // The ordinary case, and the one the map editor draws: authoring happens
    // at the map's own size, so an anchor changes nothing until the map is
    // loaded somewhere else.
    for (const anchor of ANCHORS) {
      expect(anchored(at(37, 61), anchor, at(200, 100), at(200, 100))).toEqual(
        at(37, 61),
      );
    }
  });

  it('holds a centred thing in the middle', () => {
    expect(anchored(at(100, 50), 'center', at(200, 100), at(300, 400))).toEqual(
      at(150, 200),
    );
  });

  it('leaves the axis an edge does not name alone, relative to its middle', () => {
    // `top` is about the TOP, and across is the middle — so a title centred
    // on a narrow map is centred on a wide one, and stays at its distance
    // from the top either way.
    expect(anchored(at(100, 12), 'top', at(200, 100), at(400, 900))).toEqual(
      at(200, 12),
    );
  });
});

describe('isAnchor', () => {
  it('knows the nine, and nothing else', () => {
    // A stored map is JSON and may say anything; an anchor it does not know
    // has to mean "not anchored" rather than throw a world away.
    expect(isAnchor('bottom right')).toBe(true);
    expect(isAnchor('middle')).toBe(false);
    expect(isAnchor(undefined)).toBe(false);
    expect(isAnchor(3)).toBe(false);
  });
});
