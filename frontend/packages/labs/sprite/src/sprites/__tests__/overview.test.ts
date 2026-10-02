import p5 from 'p5';
import {describe, expect, it} from 'vitest';

import {preDraw} from '../lifecycle';
import type {Sprite} from '../Sprite';
import type {SpriteP5} from '../types';

import {context2d, frame, frames, makeInstance} from './harness';

describe('overview.md', () => {
  it('LIF-1: two instances share no state and nothing is global', async () => {
    const a = await makeInstance();
    const b = await makeInstance();
    a.createSprite();
    expect(a.allSprites.length).toBe(1);
    expect(b.allSprites.length).toBe(0);
    expect(a.allSprites).not.toBe(b.allSprites);
    expect(a.World).not.toBe(b.World);
    expect(a.camera).not.toBe(b.camera);
    const proto = p5.prototype as unknown as Record<string, unknown>;
    for (const name of ['createSprite', 'allSprites', 'World', 'drawSprites']) {
      expect(Object.prototype.hasOwnProperty.call(proto, name)).toBe(false);
      expect(name in globalThis).toBe(false);
    }
  });

  it('LIF-2: every member exists and lazy members are stable', async () => {
    const p = await makeInstance();
    for (const name of [
      'createSprite',
      'createGroup',
      'drawSprites',
      'drawSprite',
      'createEdgeSprites',
      'keyDown',
      'keyWentDown',
      'keyWentUp',
      'mouseDown',
      'mouseUp',
      'mouseWentDown',
      'mouseWentUp',
      'mouseIsOver',
      'mousePressedOver',
      'loadAnimation',
      'loadSpriteSheet',
      'rgb',
    ] as const) {
      expect(typeof p[name]).toBe('function');
    }
    expect(typeof p.Group).toBe('function');
    expect(new p.Group()).toBeInstanceOf(Array);
    expect(p.allSprites).toBe(p.allSprites);
    expect(p.World).toBe(p.World);
    expect(p.camera).toBe(p.camera);
    expect(p.edges).toBeUndefined();
    expect(p.predefinedAnimations).toBeUndefined();
    expect(p.pauseAnimationsByDefault).toBe(false);
    p.predefinedAnimations = {};
    p.pauseAnimationsByDefault = true;
    expect(p.predefinedAnimations).toEqual({});
    expect(p.pauseAnimationsByDefault).toBe(true);
    expect(typeof p.worldStartTime).toBe('number');
  });

  it('LIF-4, LIF-23, LIF-26, L1: attachment defaults', async () => {
    let rateInSetup: number | undefined;
    const p = await makeInstance(q => {
      rateInSetup = q.frameRate();
    });
    expect(rateInSetup).toBe(0);
    expect(p.angleMode()).toBe(p.DEGREES);
    expect(p.getTargetFrameRate()).toBe(30);
    expect(p.width).toBe(400);
    expect(p.height).toBe(400);
    expect(p.frameCount).toBe(0);
    expect(p.allSprites.length).toBe(0);
    expect(p.edges).toBeUndefined();
    expect(p.camera.x).toBe(0);
    expect(p.camera.y).toBe(0);
    expect(p.camera.zoom).toBe(1);
    expect(p.camera.active).toBe(false);
  });

  it('CMP-3, LIF-5: the start time is the wall clock at attachment and survives a rerun', async () => {
    const before = Date.now();
    const p = await makeInstance();
    const after = Date.now();
    expect(p.worldStartTime).toBeGreaterThanOrEqual(before);
    expect(p.worldStartTime).toBeLessThanOrEqual(after);
    const start = p.worldStartTime;
    p.allSprites.removeSprites();
    p.edges = undefined;
    await frame(p);
    expect(p.worldStartTime).toBe(start);
  });

  it('LIF-6: fill is opaque grey after any canvas is created', async () => {
    const p = await makeInstance(s => {
      s.fill(255, 0, 0);
      s.createCanvas(300, 200);
    });
    expect(p.width).toBe(300);
    expect(p.height).toBe(200);
    const style = String(context2d(p).fillStyle).toLowerCase();
    expect(['#7f7f7f', 'rgb(127, 127, 127)']).toContain(style);
  });

  it('LIF-6: the default canvas also gets the grey fill', async () => {
    const p = await makeInstance();
    const style = String(context2d(p).fillStyle).toLowerCase();
    expect(['#7f7f7f', 'rgb(127, 127, 127)']).toContain(style);
  });

  it('CMP-4, LIF-8, L9: rgb scales alpha and treats a falsy alpha as 1', async () => {
    const p = await makeInstance();
    const half = p.rgb(92, 101, 180, 0.5);
    expect([p.red(half), p.green(half), p.blue(half)]).toEqual([92, 101, 180]);
    expect(p.alpha(half)).toBe(127.5);
    expect(p.alpha(p.rgb(1, 2, 3))).toBe(255);
    expect(p.alpha(p.rgb(1, 2, 3, 0))).toBe(255);
  });

  it('LIF-9, LIF-10, L3: a frame updates sprites, then the camera draws; post-draw turns it off', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0);
    s.velocity.x = 1;
    let seen: unknown[] = [];
    await frame(p, () => {
      seen = [p.camera.active, p.camera.x, s.x, p.frameCount];
    });
    expect(seen).toEqual([true, 200, 1, 1]);
    expect(p.camera.active).toBe(false);
  });

  it('LIF-10, L2: the update pass runs before the camera is turned on', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    const update = s.update.bind(s);
    let activeDuringUpdate: boolean | undefined;
    s.update = () => {
      activeDuringUpdate = p.camera.active;
      update();
    };
    await frame(p);
    expect(activeDuringUpdate).toBe(false);
  });

  it('CMP-2, LIF-20, L4: preview runs the pre phase and program without post-draw', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0);
    s.velocity.x = 1;
    await frame(p);
    preDraw(p as unknown as p5);
    expect(s.x).toBe(2);
    expect(p.camera.active).toBe(true);
    // The next pre phase does not activate twice.
    await frame(p);
    expect(s.x).toBe(3);
    expect(p.camera.active).toBe(false);
  });

  it('CMP-1, LIF-11, L5, L6: a removed sprite hides the next one from this pass', async () => {
    const p = await makeInstance();
    const [a, b, c] = [p.createSprite(), p.createSprite(), p.createSprite()];
    for (const s of [a, b, c]) {
      s.lifetime = 1;
    }
    await frame(p);
    expect([a.removed, b.removed, c.removed]).toEqual([true, false, true]);
    expect(p.allSprites.length).toBe(1);
    expect(b.lifetime).toBe(1);
    await frame(p);
    expect(b.removed).toBe(true);
    expect(p.allSprites.length).toBe(0);
  });

  it('CMP-1, LIF-11, L7, L8: the skipped sprite does not move that frame', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(0, 0);
    const c = p.createSprite(0, 0);
    a.lifetime = 1;
    b.velocity.x = 1;
    c.velocity.x = 1;
    await frame(p);
    expect(a.removed).toBe(true);
    expect(b.x).toBe(0);
    expect(c.x).toBe(1);
    await frame(p);
    expect(b.x).toBe(1);
    expect(c.x).toBe(2);
  });

  it('LIF-12: after drawSprites the update order is ascending depth', async () => {
    const p = await makeInstance();
    const order: string[] = [];
    const make = (name: string, depth: number): Sprite => {
      const s = p.createSprite();
      s.depth = depth;
      const update = s.update.bind(s);
      s.update = () => {
        order.push(name);
        update();
      };
      return s;
    };
    make('a', 5);
    make('b', 2);
    make('c', 2);
    await frame(p, () => p.drawSprites());
    order.length = 0;
    make('d', 0);
    await frame(p);
    expect(order).toEqual(['b', 'c', 'a', 'd']);
  });

  it('LIF-17, LIF-18: a sprite made during setup is updated in frame 1 before it is drawn', async () => {
    let s: Sprite | undefined;
    const p = await makeInstance(q => {
      s = q.createSprite(0, 0);
      s.velocity.x = 1;
    });
    let drawnAt: number | undefined;
    await frame(p, () => {
      drawnAt = s!.x;
    });
    expect(drawnAt).toBe(1);
  });

  it('LIF-17: a sprite made during the draw program is first updated next frame', async () => {
    const p = await makeInstance();
    let s: Sprite | undefined;
    await frame(p, () => {
      s = p.createSprite(5, 0);
      s.velocity.x = 1;
    });
    expect(s!.x).toBe(5);
    await frame(p);
    expect(s!.x).toBe(6);
  });

  it('LIF-17: when the program throws, post-draw does not run', async () => {
    const p = await makeInstance();
    await expect(
      frame(p, () => {
        throw new Error('stop');
      }),
    ).rejects.toThrow('stop');
    expect(p.camera.active).toBe(true);
  });

  it('LIF-15, LIF-21: an asynchronous program defers post-draw until it finishes', async () => {
    const p = await makeInstance();
    let finish: () => void = () => {};
    let activeInside: boolean | undefined;
    (p as unknown as p5).draw = (
      await import('../lifecycle')
    ).withSpriteLifecycle(p as unknown as p5, () => {
      activeInside = p.camera.active;
      return new Promise<void>(resolve => {
        finish = resolve;
      });
    });
    const done = (p as unknown as p5).redraw();
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(activeInside).toBe(true);
    expect(p.camera.active).toBe(true);
    finish();
    await done;
    expect(p.camera.active).toBe(false);
  });

  it('LIF-19: a rerun keeps frameCount, start time and camera; depths restart at 1', async () => {
    const p = await makeInstance();
    p.createSprite();
    p.createEdgeSprites();
    await frames(p, 2);
    const start = p.worldStartTime;
    p.allSprites.removeSprites();
    p.edges = undefined;
    expect(p.createSprite().depth).toBe(1);
    await frame(p);
    expect(p.frameCount).toBe(3);
    expect(p.worldStartTime).toBe(start);
    expect(p.camera.x).toBe(200);
  });

  it('LIF-24: createSprite() with no arguments is at (0, 0) and movable', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    expect([s.x, s.y]).toEqual([0, 0]);
    s.x = 7;
    s.position.y = 9;
    expect([s.x, s.y]).toEqual([7, 9]);
  });

  it('LIF-25: ellipse with the height omitted draws a circle (upstream p5)', async () => {
    const p: SpriteP5 = await makeInstance();
    const context = p.drawingContext as unknown as {
      __clearEvents(): void;
      __getEvents(): {type: string; props: Record<string, number>}[];
    };
    context.__clearEvents();
    p.ellipse(50, 50, 20);
    const fill = context.__getEvents().find(event => event.type === 'fill');
    const path = (
      fill?.props as unknown as {
        path: {type: string; props: Record<string, number>}[];
      }
    ).path;
    const ellipse = path.find(segment => segment.type === 'ellipse');
    expect(ellipse?.props.radiusX).toBe(10);
    expect(ellipse?.props.radiusY).toBe(10);
  });
});
