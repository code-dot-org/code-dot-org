import {describe, expect, it, vi} from 'vitest';

import type {Sprite} from '../Sprite';

import {
  context2d,
  type Call,
  frame,
  frames,
  makeInstance,
  recordP5,
  setMouse,
} from './harness';

describe('world.md', () => {
  it('WLD-1..WLD-7, W1: a fresh World', async () => {
    let rateInSetup: number | undefined;
    const p = await makeInstance(q => {
      rateInSetup = q.World.frameRate;
    });
    const w = p.World;
    expect(p.World).toBe(w);
    expect([w.width, w.height, w.frameCount]).toEqual([400, 400, 0]);
    expect([w.mouseX, w.mouseY, w.seconds]).toEqual([0, 0, 0]);
    expect(rateInSetup).toBe(0);
  });

  it('WLD-2: width and height follow the canvas', async () => {
    const p = await makeInstance();
    p.resizeCanvas(300, 200);
    expect([p.World.width, p.World.height]).toEqual([300, 200]);
  });

  it('WLD-4, W2: frameCount after two frames', async () => {
    const p = await makeInstance();
    await frames(p, 2);
    expect(p.World.frameCount).toBe(2);
  });

  it('WLD-6, W3: assigning frameRate sets the target rate', async () => {
    const p = await makeInstance();
    p.World.frameRate = 12;
    expect(p.getTargetFrameRate()).toBe(12);
    p.World.frameRate = -1;
    p.World.frameRate = 0;
    p.World.frameRate = '20' as unknown as number;
    expect(p.getTargetFrameRate()).toBe(12);
  });

  it('WLD-8, W4: the read-only members throw in strict code', async () => {
    const p = await makeInstance();
    const w = p.World as unknown as Record<string, unknown>;
    for (const name of [
      'width',
      'height',
      'mouseX',
      'mouseY',
      'allSprites',
      'frameCount',
      'seconds',
    ]) {
      const before = w[name];
      expect(() => {
        w[name] = 5;
      }).toThrow(TypeError);
      expect(w[name]).toBe(before);
    }
    expect(p.World.width).toBe(400);
  });

  it('WLD-3, W5: mouse position is read at the time of the read', async () => {
    const p = await makeInstance();
    setMouse(p, 123, 45);
    expect([p.World.mouseX, p.World.mouseY]).toEqual([123, 45]);
  });

  it('CMP-31, WLD-3, W6: World.mouseX is not corrected for the camera', async () => {
    const p = await makeInstance();
    await frame(p);
    setMouse(p, 123, 45);
    p.camera.x = 300;
    p.camera.zoom = 2;
    await frame(p);
    expect(p.World.mouseX).toBe(123);
    expect(p.camera.mouseX).toBe(223);
    expect(p.camera.mouseY).toBe(45);
  });

  it('CMP-3, WLD-7: seconds count from attachment', async () => {
    const p = await makeInstance();
    const start = p.worldStartTime;
    const now = vi.spyOn(Date, 'now');
    now.mockReturnValue(start + 2499);
    expect(p.World.seconds).toBe(2);
    now.mockReturnValue(start + 2500);
    expect(p.World.seconds).toBe(3);
    now.mockRestore();
  });

  it('WLD-9, WLD-11, WLD-14, W10: drawSprites skips invisible sprites but sorts them', async () => {
    const p = await makeInstance();
    const a = p.createSprite(1, 0);
    const b = p.createSprite(2, 0);
    const c = p.createSprite(3, 0);
    a.depth = 5;
    b.depth = 2;
    c.depth = 2;
    a.visible = false;
    const stop = recordP5(p);
    p.drawSprites();
    const translated = stop()
      .filter(call => call[0] === 'translate')
      .map(call => call[1]);
    expect(translated).toEqual([2, 3]);
    expect([...p.allSprites]).toEqual([b, c, a]);
  });

  it('WLD-9: a falsy argument draws allSprites', async () => {
    const p = await makeInstance();
    p.createSprite(7, 0);
    const stop = recordP5(p);
    p.drawSprites(undefined);
    expect(stop()).toContainEqual(['translate', 7, 0]);
  });

  it('CMP-39, WLD-10, W11: drawSprites of a non-group throws', async () => {
    const p = await makeInstance();
    try {
      p.drawSprites({} as never);
      expect.unreachable();
    } catch (e) {
      expect(String(e)).toBe(
        'Error: with drawSprites you can only draw all sprites or a group',
      );
    }
  });

  it('WLD-12, WLD-13: drawSprites does not update, animate or change the transform', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0);
    s.velocity.x = 1;
    const before = context2d(p).getTransform().toString();
    p.drawSprites();
    expect(s.x).toBe(0);
    expect(context2d(p).getTransform().toString()).toBe(before);
    expect(p.camera.active).toBe(false);
  });

  it('WLD-14, W12: drawSprite draws one sprite, or nothing', async () => {
    const p = await makeInstance();
    const s = p.createSprite(4, 0);
    let stop = recordP5(p);
    p.drawSprite(undefined);
    expect(stop()).toEqual([]);
    stop = recordP5(p);
    p.drawSprite(s);
    expect(stop()).toContainEqual(['translate', 4, 0] as Call);
  });

  it('WLD-15..WLD-18, W7: createEdgeSprites', async () => {
    const p = await makeInstance();
    p.createSprite().depth = 7;
    const edges = p.createEdgeSprites();
    const describe = (s: Sprite) => [s.x, s.y, s.width, s.height, s.depth];
    expect(describe(p.leftEdge!)).toEqual([-50, 200, 100, 400, 8]);
    expect(describe(p.rightEdge!)).toEqual([450, 200, 100, 400, 9]);
    expect(describe(p.topEdge!)).toEqual([200, -50, 400, 100, 10]);
    expect(describe(p.bottomEdge!)).toEqual([200, 450, 400, 100, 11]);
    expect([...edges]).toEqual([
      p.leftEdge,
      p.rightEdge,
      p.topEdge,
      p.bottomEdge,
    ]);
    expect(p.edges).toBe(edges);
    expect(edges.size()).toBe(4);
    expect(p.allSprites.size()).toBe(5);
    expect(p.createEdgeSprites()).toBe(edges);
    expect(p.allSprites.size()).toBe(5);
    for (const edge of edges) {
      expect(edge.visible).toBe(true);
      expect(edge.immovable).toBe(false);
      expect(edge.animation).toBeUndefined();
    }
    expect(p.createSprite().depth).toBe(12);
  });

  it('CMP-12, WLD-20, W8: removeSprites leaves edges pointing at the empty group', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    p.allSprites.removeSprites();
    expect(p.edges!.size()).toBe(0);
    expect(p.createEdgeSprites()).toBe(edges);
    expect(p.allSprites.size()).toBe(0);
  });

  it('WLD-16, WLD-19, W9: edges use the canvas size at the call and do not follow it', async () => {
    const p = await makeInstance(q => {
      q.createCanvas(300, 200);
    });
    p.createEdgeSprites();
    const at = (s: Sprite) => [s.x, s.y, s.width, s.height];
    expect(at(p.leftEdge!)).toEqual([-50, 100, 100, 200]);
    expect(at(p.rightEdge!)).toEqual([350, 100, 100, 200]);
    expect(at(p.topEdge!)).toEqual([150, -50, 300, 100]);
    expect(at(p.bottomEdge!)).toEqual([150, 250, 300, 100]);
    p.resizeCanvas(400, 400);
    expect(at(p.rightEdge!)).toEqual([350, 100, 100, 200]);
  });

  it('CMP-12, WLD-20, W13: after edges is cleared, createEdgeSprites makes new ones', async () => {
    const p = await makeInstance();
    const old = p.createEdgeSprites();
    p.allSprites.removeSprites();
    p.edges = undefined;
    const edges = p.createEdgeSprites();
    expect(edges).not.toBe(old);
    expect(edges.size()).toBe(4);
    expect(edges.map(s => s.depth)).toEqual([1, 2, 3, 4]);
  });

  it('WLD-18: edge sprites are updated and drawn like any other', async () => {
    const p = await makeInstance();
    p.createEdgeSprites();
    p.leftEdge!.velocity.x = 1;
    await frame(p);
    expect(p.leftEdge!.x).toBe(-49);
    const stop = recordP5(p);
    p.drawSprites();
    expect(stop()).toContainEqual(['rect', 0, 0, 100, 400]);
  });
});
