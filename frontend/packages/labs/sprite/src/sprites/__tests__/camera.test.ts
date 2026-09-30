import type p5 from 'p5';
import {describe, expect, it} from 'vitest';

import {
  backgroundFrame,
  cameraFocus,
  clampZoom,
  stepZoom,
  worldPoint,
} from '../../camera';
import {Camera} from '../camera';
import {postDraw, preDraw} from '../lifecycle';
import type {SpriteP5} from '../types';

import {context2d, frame, makeInstance, recordP5, setMouse} from './harness';

function matrix(p: SpriteP5): number[] {
  const m = context2d(p).getTransform();
  return [m.a, m.b, m.c, m.d, m.e, m.f];
}

const IDENTITY = [1, 0, 0, 1, 0, 0];

describe('camera.md: the camera object', () => {
  it('CAM-1, CAM-3, CAM-4, CAM-5, CAM-7: a new instance', async () => {
    const p = await makeInstance();
    const c = p.camera;
    expect(c).toBeInstanceOf(Camera);
    expect([
      c.x,
      c.y,
      c.zoom,
      c.active,
      c.isActive(),
      c.mouseX,
      c.mouseY,
    ]).toEqual([0, 0, 1, false, false, 0, 0]);
    expect(p.camera).toBe(c);
  });

  it('CAM-1: the camera exists before setup; Camera is bound to the instance', async () => {
    let early: unknown;
    const p = await makeInstance(q => {
      early = q.camera;
    });
    expect(early).toBe(p.camera);
    const other = new p.Camera(5, 6, 2);
    expect(other).toBeInstanceOf(Camera);
    expect([other.x, other.y, other.zoom, other.active]).toEqual([
      5,
      6,
      2,
      false,
    ]);
  });

  it('CAM-2: x and y are accessors over position', async () => {
    const p = await makeInstance();
    const c = p.camera;
    c.x = 12;
    c.y = 34;
    expect([c.position.x, c.position.y]).toEqual([12, 34]);
    c.position.x = 56;
    c.position.y = 78;
    expect([c.x, c.y]).toEqual([56, 78]);
  });

  it('CAM-4: mouseX and mouseY are writable numbers', async () => {
    const p = await makeInstance();
    p.camera.mouseX = 7;
    p.camera.mouseY = 8;
    expect([p.camera.mouseX, p.camera.mouseY]).toEqual([7, 8]);
  });
});

describe('camera.md: activation', () => {
  it('CAM-7, CAM-9, CAM-10, CAM-11: the first frame at zoom 1', async () => {
    const p = await makeInstance();
    setMouse(p, 10, 20);
    let seen: unknown[] = [];
    await frame(p, () => {
      const c = p.camera;
      seen = [c.x, c.y, c.active, c.mouseX, c.mouseY, matrix(p)];
    });
    expect(seen).toEqual([200, 200, true, 10, 20, IDENTITY]);
    expect(p.camera.active).toBe(false);
    expect(matrix(p)).toEqual(IDENTITY);
  });

  it('CMP-30, CAM-9, CAM-10, CAM-11, CAM-12: zoom 2 at (250, 200), off, on, on, post', async () => {
    const p = await makeInstance();
    await frame(p);
    const c = p.camera;
    c.zoom = 2;
    c.x = 250;
    c.y = 200;
    setMouse(p, 10, 20);
    preDraw(p as unknown as p5);
    expect([c.mouseX, c.mouseY]).toEqual([60, 20]);
    expect(matrix(p)).toEqual([2, 0, 0, 2, -300, -200]);
    const [a, , , d, e, f] = matrix(p);
    expect([a * 250 + e, d * 200 + f]).toEqual([200, 200]);
    c.off();
    expect([c.active, matrix(p)]).toEqual([false, IDENTITY]);
    c.on();
    expect([c.active, matrix(p)]).toEqual([true, [2, 0, 0, 2, -300, -200]]);
    c.on();
    expect(matrix(p)).toEqual([2, 0, 0, 2, -300, -200]);
    postDraw(p as unknown as p5);
    expect([c.active, matrix(p)]).toEqual([false, IDENTITY]);
  });

  it('CAM-9: step 2 runs on on() while active; step 3 does not', async () => {
    const p = await makeInstance();
    await frame(p, () => {
      setMouse(p, 30, 40);
      const stop = recordP5(p);
      p.camera.on();
      const calls = stop();
      expect(calls).toEqual([]);
      // CAM-14: on() while active is not an activation; the snapshot stays.
      expect([p.camera.mouseX, p.camera.mouseY]).toEqual([0, 0]);
    });
  });

  it('CAM-9: activation pushes, scales, then translates', async () => {
    const p = await makeInstance();
    await frame(p);
    p.camera.zoom = 4;
    const stop = recordP5(p);
    preDraw(p as unknown as p5);
    const calls = stop();
    expect(calls).toEqual([
      ['push'],
      ['scale', 4],
      ['translate', -200 + 50, -200 + 50],
    ]);
    postDraw(p as unknown as p5);
  });

  it('CAM-11: post-phase deactivation does nothing when already inactive', async () => {
    const p = await makeInstance();
    await frame(p, () => p.camera.off());
    const stop = recordP5(p);
    postDraw(p as unknown as p5);
    expect(stop()).toEqual([]);
    expect(p.camera.active).toBe(false);
  });

  it('CAM-12: styles set while active are undone at deactivation', async () => {
    const p = await makeInstance();
    const q = p as unknown as p5;
    q.fill(10, 20, 30);
    await frame(p, () => q.fill(200, 0, 0));
    expect(context2d(p).fillStyle).toBe('#0a141e');
  });

  it('CAM-13: position and zoom changes while active wait for the next activation', async () => {
    const p = await makeInstance();
    await frame(p, () => {
      p.camera.x = 300;
      p.camera.zoom = 2;
      expect(matrix(p)).toEqual(IDENTITY);
      p.camera.off();
      p.camera.on();
      expect(matrix(p)).toEqual([2, 0, 0, 2, -400, -200]);
    });
    await frame(p, () => expect(matrix(p)).toEqual([2, 0, 0, 2, -400, -200]));
  });

  it('CAM-14: camera.mouseX is a snapshot at activation', async () => {
    const p = await makeInstance();
    setMouse(p, 10, 20);
    await frame(p, () => {
      setMouse(p, 90, 80);
      expect([p.camera.mouseX, p.camera.mouseY]).toEqual([10, 20]);
    });
  });

  it('CAM-8: once initialised, a position of (0, 0) is honoured', async () => {
    const p = await makeInstance();
    await frame(p);
    p.camera.x = 0;
    p.camera.y = 0;
    await frame(p);
    expect([p.camera.x, p.camera.y]).toEqual([0, 0]);
  });

  it('CAM-7: a zoom set before the first frame is kept', async () => {
    const p = await makeInstance();
    p.camera.zoom = 3;
    await frame(p);
    expect([p.camera.x, p.camera.y, p.camera.zoom]).toEqual([200, 200, 3]);
  });

  it('CMP-33, CAM-8: a camera first activated elsewhere centres later at (0, 0)', async () => {
    const p = await makeInstance();
    p.camera.x = 50;
    p.camera.y = 50;
    await frame(p);
    expect([p.camera.x, p.camera.y]).toEqual([50, 50]);
    p.camera.x = 0;
    p.camera.y = 0;
    await frame(p);
    expect([p.camera.x, p.camera.y]).toEqual([200, 200]);
    p.camera.x = 0;
    p.camera.y = 0;
    await frame(p);
    expect([p.camera.x, p.camera.y]).toEqual([0, 0]);
  });

  it('CAM-7: a camera at (0, 5) is not centred', async () => {
    const p = await makeInstance();
    p.camera.y = 5;
    await frame(p);
    expect([p.camera.x, p.camera.y]).toEqual([0, 5]);
  });

  it('CAM-9: the canvas size, not 400, gives the centre', async () => {
    const p = await makeInstance(q =>
      (q as unknown as p5).resizeCanvas(300, 100),
    );
    await frame(p);
    expect([p.camera.x, p.camera.y]).toEqual([150, 50]);
  });
});

describe('camera.md: the mouse hit test', () => {
  it('CAM-15: mouseIsOver tests camera.mouseX only while active', async () => {
    const p = await makeInstance();
    const s = p.createSprite(300, 200, 20, 20);
    await frame(p);
    p.camera.x = 300;
    p.camera.y = 200;
    setMouse(p, 200, 200);
    expect(p.mouseIsOver(s)).toBe(false);
    let during: unknown[] = [];
    await frame(p, () => {
      during = [p.camera.mouseX, p.mouseIsOver(s)];
    });
    expect(during).toEqual([300, true]);
    expect(p.mouseIsOver(s)).toBe(false);
  });

  it('CMP-37, CAM-15, INP-27: mousePressedOver uses the camera point and the raw flags', async () => {
    const p = await makeInstance();
    const s = p.createSprite(300, 200, 20, 20);
    await frame(p);
    p.camera.x = 300;
    setMouse(p, 200, 200);
    const raw = p as unknown as {mouseIsPressed: boolean};
    let during: unknown[] = [];
    await frame(p, () => {
      const before = p.mousePressedOver(s);
      raw.mouseIsPressed = true;
      during = [before, p.mousePressedOver(s), p.mouseWentDown()];
      raw.mouseIsPressed = false;
      p.touchIsDown = true;
      during.push(p.mousePressedOver(s));
      p.touchIsDown = false;
    });
    expect(during).toEqual([false, true, false, true]);
  });

  it('INP-26: mouseIsOver of a missing sprite is false', async () => {
    const p = await makeInstance();
    expect(p.mouseIsOver(undefined)).toBe(false);
  });

  it('CMP-31, CAM-16: World.mouseX is never mapped through the camera', async () => {
    const p = await makeInstance();
    setMouse(p, 10, 20);
    await frame(p, () => {
      p.camera.zoom = 2;
    });
    p.camera.x = 350;
    await frame(p, () => {
      expect([p.World.mouseX, p.World.mouseY]).toEqual([10, 20]);
      expect(p.camera.mouseX).toBe(160);
    });
  });
});

describe("camera.md: Sprite Lab 2's camera", () => {
  it('CAM-17: the target zoom is clamped to [1, 3]', () => {
    expect([clampZoom(0), clampZoom(2), clampZoom(9), clampZoom(NaN)]).toEqual([
      1, 2, 3, 1,
    ]);
  });

  it('CAM-18 step 1: the zoom eases and snaps', () => {
    const a = stepZoom(1, 3);
    const b = stepZoom(a, 3);
    const c = stepZoom(b, 3);
    expect([a, b, c]).toEqual([1.5, 1.875, 2.15625]);
    expect(stepZoom(2.9995, 3)).toBe(3);
  });

  it('CAM-18 step 4: the focus is clamped', () => {
    expect(cameraFocus(2, {x: 50, y: 390})).toEqual({x: 100, y: 300});
    expect(cameraFocus(2, null)).toEqual({x: 200, y: 200});
  });

  it('CMP-32, CAM-18 step 2: the zoom-correct mouse point', () => {
    expect(worldPoint({x: 0, y: 0}, 2, {x: 100, y: 300})).toEqual({
      x: 0,
      y: 200,
    });
  });

  it('CAM-18 step 5: the background square', () => {
    expect(backgroundFrame(2, {x: 100, y: 300})).toEqual({
      x: -200,
      y: -400,
      size: 1000,
    });
    expect(backgroundFrame(1, {x: 200, y: 200})).toEqual({
      x: 0,
      y: 0,
      size: 400,
    });
  });

  it('CMP-32, CAM-18, CAM-19, CAM-20: one frame of the platform draw routine', async () => {
    const p = await makeInstance();
    const player = p.createSprite(50, 390, 10, 10);
    const target = 3;
    let zoom = 1;
    const pass = (z: number, focus: {x: number; y: number}) => {
      p.camera.off();
      expect(matrix(p)).toEqual(IDENTITY);
      p.camera.zoom = z;
      p.camera.position.x = focus.x;
      p.camera.position.y = focus.y;
      p.camera.on();
      p.drawSprites();
      p.camera.off();
    };
    const seen: unknown[] = [];
    setMouse(p, 0, 0);
    await frame(p, () => {
      zoom = stepZoom(zoom, target);
      const mouse = worldPoint({x: p.mouseX, y: p.mouseY}, zoom, p.camera);
      p.camera.mouseX = mouse.x;
      p.camera.mouseY = mouse.y;
      seen.push(p.camera.active, p.camera.mouseX, p.camera.mouseY);
      // CAM-20: a first-frame capture pass.
      pass(1, {x: 200, y: 200});
      const focus = cameraFocus(zoom, {x: player.x, y: player.y});
      p.camera.off();
      p.camera.zoom = zoom;
      p.camera.position.x = focus.x;
      p.camera.position.y = focus.y;
      p.camera.on();
      seen.push(matrix(p));
      p.drawSprites();
      p.camera.off();
    });
    const half = 200 / 1.5;
    const [active, mouseX, mouseY, m] = seen as [
      boolean,
      number,
      number,
      number[],
    ];
    expect([active, mouseX, mouseY]).toEqual([true, 200 - half, 200 - half]);
    const expected = [
      1.5,
      0,
      0,
      1.5,
      200 - 1.5 * half,
      200 - 1.5 * (400 - half),
    ];
    m.forEach((value, i) => expect(value).toBeCloseTo(expected[i], 9));
    expect(p.camera.active).toBe(false);
    expect(matrix(p)).toEqual(IDENTITY);
  });

  it('CAM-21: an untouched camera is the identity at (200, 200)', async () => {
    const p = await makeInstance();
    await frame(p);
    await frame(p, () => {
      expect([p.camera.x, p.camera.y, p.camera.zoom]).toEqual([200, 200, 1]);
      expect(matrix(p)).toEqual(IDENTITY);
    });
  });
});
