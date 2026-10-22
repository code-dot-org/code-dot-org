import {
  backgroundFrame,
  backgroundZoom,
  cameraFocus,
  clampZoom,
  MAX_ZOOM,
  MIN_ZOOM,
  stepZoom,
  worldBounds,
  worldPoint,
} from '@cdo/apps/p5lab/spritelab/lab2/camera';

describe('camera', () => {
  it('clamps zoom to its range and rejects non-numbers', () => {
    expect(clampZoom(2)).toBe(2);
    expect(clampZoom(0)).toBe(MIN_ZOOM);
    expect(clampZoom(99)).toBe(MAX_ZOOM);
    expect(clampZoom(NaN)).toBe(MIN_ZOOM);
  });

  it('eases toward the target and snaps when close', () => {
    const first = stepZoom(1, 2);
    expect(first).toBeGreaterThan(1);
    expect(first).toBeLessThan(2);
    expect(stepZoom(2, 2)).toBe(2);
    expect(stepZoom(1.9999, 2)).toBe(2);
    let zoom = 1;
    for (let frame = 0; frame < 60; frame++) {
      zoom = stepZoom(zoom, 3);
    }
    expect(zoom).toBe(3);
  });

  it('zooms the background harder than the sprite plane', () => {
    expect(backgroundZoom(1)).toBe(1);
    expect(backgroundZoom(3)).toBe(4);
  });

  it('centers the view without a target, and always at zoom 1', () => {
    expect(cameraFocus(2, null)).toEqual({x: 200, y: 200});
    expect(cameraFocus(1, {x: 30, y: 380})).toEqual({x: 200, y: 200});
  });

  it('follows the target and clamps the view inside the world', () => {
    expect(cameraFocus(2, {x: 150, y: 250})).toEqual({x: 150, y: 250});
    expect(cameraFocus(2, {x: 10, y: 390})).toEqual({x: 100, y: 300});
  });

  it('scrolls at zoom 1 over a world wider and taller than the canvas', () => {
    const bounds = worldBounds(2);
    expect(bounds).toEqual({left: 0, top: -400, right: 800, bottom: 400});
    expect(cameraFocus(1, null, bounds)).toEqual({x: 200, y: 200});
    expect(cameraFocus(1, {x: 500, y: -100}, bounds)).toEqual({
      x: 500,
      y: -100,
    });
    expect(cameraFocus(1, {x: 790, y: -390}, bounds)).toEqual({
      x: 600,
      y: -200,
    });
    expect(cameraFocus(1, {x: 10, y: 390}, bounds)).toEqual({x: 200, y: 200});
  });

  it("keeps the background's edges out of view across a bigger world", () => {
    const bounds = worldBounds(3);
    for (const zoom of [1, 2, MAX_ZOOM]) {
      for (const corner of [
        {x: 0, y: -800},
        {x: 1200, y: 400},
        {x: 600, y: -200},
      ]) {
        const focus = cameraFocus(zoom, corner, bounds);
        const {x, y, size} = backgroundFrame(zoom, focus, bounds);
        expect(x).toBeLessThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(0);
        expect(x + size).toBeGreaterThanOrEqual(400);
        expect(y + size).toBeGreaterThanOrEqual(400);
      }
    }
    // The canvas-sized world is unchanged by the bounds argument.
    expect(backgroundFrame(1, cameraFocus(1, null), worldBounds(1))).toEqual({
      x: 0,
      y: 0,
      size: 400,
    });
  });

  it('draws the background exactly full-canvas at zoom 1', () => {
    expect(backgroundFrame(1, cameraFocus(1, null))).toEqual({
      x: 0,
      y: 0,
      size: 400,
    });
  });

  it("keeps the background's edges out of view at the world's edges", () => {
    for (const zoom of [1.5, 2, MAX_ZOOM]) {
      for (const corner of [
        {x: 0, y: 0},
        {x: 400, y: 400},
      ]) {
        const {x, y, size} = backgroundFrame(zoom, cameraFocus(zoom, corner));
        expect(x).toBeLessThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(0);
        expect(x + size).toBeGreaterThanOrEqual(400);
        expect(y + size).toBeGreaterThanOrEqual(400);
      }
    }
  });

  it('maps screen points into the world under the camera', () => {
    // Identity at zoom 1, centered.
    expect(worldPoint({x: 30, y: 370}, 1, {x: 200, y: 200})).toEqual({
      x: 30,
      y: 370,
    });
    // Zoomed in: the view center is the focus; a screen corner lands half a
    // view away.
    expect(worldPoint({x: 200, y: 200}, 2, {x: 150, y: 250})).toEqual({
      x: 150,
      y: 250,
    });
    expect(worldPoint({x: 0, y: 400}, 2, {x: 150, y: 250})).toEqual({
      x: 50,
      y: 350,
    });
  });

  it("pans the background at half the foreground's screen rate", () => {
    // The parallax: at zoom 2 a full traversal shifts the foreground one
    // screen (400 px) on screen; the background shifts half that, the same
    // direction.
    const left = backgroundFrame(2, cameraFocus(2, {x: 0, y: 200}));
    const right = backgroundFrame(2, cameraFocus(2, {x: 400, y: 200}));
    expect(left.x - right.x).toBe(200);
  });
});
