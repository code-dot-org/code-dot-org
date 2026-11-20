import {
  backgroundFrame,
  backgroundZoom,
  cameraFocus,
  clampZoom,
  MAX_ZOOM,
  MIN_ZOOM,
  stepZoom,
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

  describe('in a world larger than one screen', () => {
    // Three screens wide and two tall.
    const world = {left: 0, top: -400, right: 1200, bottom: 400};

    it('follows the player across it and stops at its edges', () => {
      expect(cameraFocus(1, {x: 600, y: 0}, world)).toEqual({x: 600, y: 0});
      expect(cameraFocus(1, {x: 20, y: 380}, world)).toEqual({x: 200, y: 200});
      expect(cameraFocus(1, {x: 1190, y: -390}, world)).toEqual({
        x: 1000,
        y: -200,
      });
    });

    it('draws the background as ever when the world is one screen', () => {
      const oneScreen = {left: 0, top: 0, right: 400, bottom: 400};
      const focus = cameraFocus(2, {x: 300, y: 100}, oneScreen);
      expect(backgroundFrame(2, focus, oneScreen)).toEqual(
        backgroundFrame(2, focus)
      );
    });

    it('starts on the first screen with no player to follow', () => {
      expect(cameraFocus(1, null, world)).toEqual({x: 200, y: 200});
    });

    it('keeps the background over the whole screen from one corner to the other', () => {
      [
        {x: 200, y: 200},
        {x: 600, y: 0},
        {x: 1000, y: -200},
      ].forEach(focus => {
        const frame = backgroundFrame(1, focus, world);
        expect(frame.x).toBeLessThanOrEqual(0);
        expect(frame.y).toBeLessThanOrEqual(0);
        expect(frame.x + frame.size).toBeGreaterThanOrEqual(400);
        expect(frame.y + frame.size).toBeGreaterThanOrEqual(400);
      });
      // The background moves as the camera does.
      expect(backgroundFrame(1, {x: 200, y: 200}, world).x).toBeGreaterThan(
        backgroundFrame(1, {x: 1000, y: 200}, world).x
      );
    });
  });
});
