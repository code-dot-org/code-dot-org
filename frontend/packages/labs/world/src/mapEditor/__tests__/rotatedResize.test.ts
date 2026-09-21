// Dragging a corner, as arithmetic.
//
// The awkward half of a resize — a box that is TURNED — with no mouse, no
// canvas and no map in sight. That is the whole reason it is a pure module
// (specs/BOXES_PLAN.md), and it is how Sketch Lab keeps the same maths
// testable on its side of the repo.

import {describe, expect, it} from 'vitest';

import {
  angleTo,
  handlePoint,
  normalizeRotation,
  RESIZE_HANDLES,
  resizeBox,
  rotationPoint,
  type Box,
} from '../rotatedResize';

/** A 100 by 60 box in the middle of nowhere, square on. */
const BOX: Box = {
  center: {x: 200, y: 100},
  width: 100,
  height: 60,
  rotation: 0,
};

const near = (value: number) => Math.round(value * 1000) / 1000;
const at = (point: {x: number; y: number}) => [near(point.x), near(point.y)];

describe('where the handles are', () => {
  it('puts each one on its corner or edge', () => {
    expect(at(handlePoint(BOX, 'top-left'))).toEqual([150, 70]);
    expect(at(handlePoint(BOX, 'bottom-right'))).toEqual([250, 130]);
    expect(at(handlePoint(BOX, 'top'))).toEqual([200, 70]);
    expect(at(handlePoint(BOX, 'left'))).toEqual([150, 100]);
  });

  it('turns them with the box', () => {
    // A quarter turn clockwise puts the top edge on the right.
    const turned = {...BOX, rotation: 90};
    expect(at(handlePoint(turned, 'top'))).toEqual([230, 100]);
  });

  it('puts the rotation grip beyond the top edge, and turns it too', () => {
    expect(at(rotationPoint(BOX, 20))).toEqual([200, 50]);
    expect(at(rotationPoint({...BOX, rotation: 180}, 20))).toEqual([200, 150]);
  });
});

describe('resizing a square-on box', () => {
  it('grows from the corner you hold, leaving the far one put', () => {
    const far = handlePoint(BOX, 'top-left');
    const next = resizeBox({
      start: BOX,
      handle: 'bottom-right',
      pointerDelta: {x: 40, y: 20},
      minWidth: 1,
      minHeight: 1,
    });

    expect(next.width).toBe(140);
    expect(next.height).toBe(80);
    expect(at(handlePoint({...BOX, ...next}, 'top-left'))).toEqual(at(far));
  });

  it('grows the other way from the opposite corner', () => {
    const far = handlePoint(BOX, 'bottom-right');
    const next = resizeBox({
      start: BOX,
      handle: 'top-left',
      pointerDelta: {x: -40, y: -20},
      minWidth: 1,
      minHeight: 1,
    });

    expect(next.width).toBe(140);
    expect(next.height).toBe(80);
    expect(at(handlePoint({...BOX, ...next}, 'bottom-right'))).toEqual(at(far));
  });

  it('leaves the other axis alone on an edge handle', () => {
    const next = resizeBox({
      start: BOX,
      handle: 'right',
      pointerDelta: {x: 30, y: 999},
      minWidth: 1,
      minHeight: 1,
    });

    expect(next.width).toBe(130);
    expect(next.height).toBe(60);
  });

  it('stops at the minimum rather than turning inside out', () => {
    const next = resizeBox({
      start: BOX,
      handle: 'right',
      pointerDelta: {x: -500, y: 0},
      minWidth: 8,
      minHeight: 8,
    });

    expect(next.width).toBe(8);
  });

  it('keeps the far edge put even while clamped', () => {
    // Clamping AFTER the new middle was worked out would let the box slide
    // away from the edge being held, which is the bug the order prevents.
    const far = handlePoint(BOX, 'left');
    const next = resizeBox({
      start: BOX,
      handle: 'right',
      pointerDelta: {x: -500, y: 0},
      minWidth: 8,
      minHeight: 8,
    });

    expect(at(handlePoint({...BOX, ...next}, 'left'))).toEqual(at(far));
  });
});

describe('resizing a turned box', () => {
  const turned: Box = {...BOX, rotation: 90};

  it('grows along the edges you can see, not along the screen', () => {
    // Turned a quarter, the box's own "wider" is the screen's "taller".
    const next = resizeBox({
      start: turned,
      handle: 'right',
      pointerDelta: {x: 0, y: 40},
      minWidth: 1,
      minHeight: 1,
    });

    expect(near(next.width)).toBe(140);
    expect(near(next.height)).toBe(60);
  });

  it('still leaves the point opposite the handle exactly where it was', () => {
    for (const handle of RESIZE_HANDLES) {
      const box: Box = {...BOX, rotation: 37};
      const opposite = RESIZE_HANDLES[(RESIZE_HANDLES.indexOf(handle) + 4) % 8];
      const far = handlePoint(box, opposite);
      const next = resizeBox({
        start: box,
        handle,
        pointerDelta: {x: 17, y: -23},
        minWidth: 1,
        minHeight: 1,
      });

      expect(at(handlePoint({...box, ...next}, opposite)), handle).toEqual(
        at(far),
      );
    }
  });
});

describe('turning', () => {
  it('wraps to 0–359, whichever way it was pushed', () => {
    expect(normalizeRotation(370)).toBe(10);
    expect(normalizeRotation(-10)).toBe(350);
    expect(normalizeRotation(360)).toBe(0);
  });

  it('measures from straight up, clockwise', () => {
    const center = {x: 0, y: 0};
    expect(angleTo(center, {x: 0, y: -10})).toBe(0);
    expect(angleTo(center, {x: 10, y: 0})).toBe(90);
    expect(angleTo(center, {x: 0, y: 10})).toBe(180);
    expect(angleTo(center, {x: -10, y: 0})).toBe(270);
  });
});
