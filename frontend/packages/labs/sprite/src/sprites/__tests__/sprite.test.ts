import type p5 from 'p5';
import {describe, expect, it} from 'vitest';

import {Animation} from '../animation';
import type {Sprite} from '../Sprite';
import type {SpriteP5} from '../types';

import {
  context2d,
  type Call,
  frame,
  frames,
  makeImage,
  makeInstance,
  recordP5,
} from './harness';

const DRAW_PREAMBLE: Call[] = [
  ['push'],
  ['colorMode', 'rgb', 255],
  ['noStroke'],
  ['rectMode', 'center'],
  ['ellipseMode', 'center'],
  ['imageMode', 'center'],
];

function draw(p: SpriteP5, s: Sprite): Call[] {
  const stop = recordP5(p);
  s.display();
  return stop();
}

/** What `CoreLibrary.addSprite` does to a sprite (SPR-29); the runtime, not the library. */
type RuntimeSprite = Sprite & {
  id: number;
  speed: number;
  direction: number;
  baseScale: number;
  setScale(k: number): void;
  getScale(): number;
};

function runtimeSetAnimation(s: RuntimeSprite, name: string): void {
  s.setAnimation(name);
  s.scale /= s.baseScale;
  s.baseScale =
    100 / Math.max(100, s.animation!.getHeight(), s.animation!.getWidth());
  s.scale *= s.baseScale;
}

function runtimeAddSprite(
  p: SpriteP5,
  options: {animation?: string; location?: {x: number; y: number}},
): RuntimeSprite {
  const location = options.location ?? {x: 200, y: 200};
  const s = p.createSprite(location.x, location.y) as RuntimeSprite;
  s.id = 0;
  s.speed = 5;
  s.direction = 0;
  s.rotation = 0;
  s.lifetime = -1;
  s.baseScale = 1;
  s.setScale = function (k: number) {
    this.scale = k * this.baseScale;
  };
  s.getScale = function () {
    return this.scale / this.baseScale;
  };
  if (options.animation) {
    runtimeSetAnimation(s, options.animation);
    s.setScale(1);
  }
  return s;
}

describe('sprite.md', () => {
  it('SPR-1..SPR-5, S1: createSprite() defaults', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    expect([s.x, s.y, s.width, s.height]).toEqual([0, 0, 100, 100]);
    expect(s.depth).toBe(1);
    expect(s.scale).toBe(1);
    expect(s.rotation).toBe(0);
    expect(s.visible).toBe(true);
    expect([s.velocity.x, s.velocity.y]).toEqual([0, 0]);
    expect(s.lifetime).toBe(-1);
    expect(s.life).toBe(-1);
    expect(s.removed).toBe(false);
    expect(s.mirrorX()).toBe(1);
    expect(s.mirrorY()).toBe(1);
    expect(s.tint).toBeUndefined();
    expect(s.getScaledHeight()).toBe(100);
    expect(s.groups.length).toBe(1);
    expect(s.groups[0]).toBe(p.allSprites);
    expect(s.getAnimationLabel()).toBe('');
    expect(s.animation).toBeUndefined();
    expect(s.debug).toBe(false);
    expect('group' in s).toBe(false);
    expect(s.collider).toBeUndefined();
    expect(s.touching).toEqual({
      left: false,
      right: false,
      top: false,
      bottom: false,
    });
    expect([s.mass, s.restitution, s.bounciness, s.immovable]).toEqual([
      1,
      1,
      1,
      false,
    ]);
    expect([
      s.friction,
      s.maxSpeed,
      s.rotationSpeed,
      s.rotateToDirection,
    ]).toEqual([0, -1, 0, false]);
    expect([s.previousPosition.x, s.previousPosition.y]).toEqual([0, 0]);
    expect(p.allSprites.contains(s)).toBe(true);
  });

  it('SPR-2, SPR-3, S2, S3: position, natural size and depth from arguments', async () => {
    const p = await makeInstance();
    p.createSprite();
    const b = p.createSprite(10, 20, 30, 40);
    expect([b.x, b.y, b.width, b.height, b.depth]).toEqual([10, 20, 30, 40, 2]);
    expect(b.getScaledHeight()).toBe(40);
    expect([b.previousPosition.x, b.previousPosition.y]).toEqual([10, 20]);
    const c = p.createSprite(1, 2);
    expect([c.width, c.height, c.depth]).toEqual([100, 100, 3]);
    expect(p.allSprites.length).toBe(3);
  });

  it('SPR-4, S5: depth is one above the live maximum', async () => {
    const p = await makeInstance();
    const [, b] = [p.createSprite(), p.createSprite(), p.createSprite()];
    b.remove();
    expect(p.createSprite().depth).toBe(4);
    expect(p.allSprites.maxDepth()).toBe(4);
    expect(p.allSprites.minDepth()).toBe(1);
    p.allSprites.removeSprites();
    expect(p.createSprite().depth).toBe(1);
  });

  it('CMP-8, SPR-4: a NaN depth among the members makes the new depth NaN', async () => {
    const p = await makeInstance();
    p.createSprite().depth = NaN;
    expect(p.createSprite().depth).toBeNaN();
  });

  it('SPR-6, SPR-7: the runtime names are absent and any property can be stored', async () => {
    const p = await makeInstance();
    const s = p.createSprite() as Sprite & Record<string, unknown>;
    for (const name of [
      'id',
      'name',
      'group',
      'speed',
      'direction',
      'delay',
      'dragging',
      'baseScale',
      'getScale',
      'setScale',
      'glideTargets',
      'targetSet',
      'initialAngle',
      'xOffset',
      'yOffset',
      'startFacing',
      'characterState',
    ]) {
      expect(name in s).toBe(false);
    }
    s.group = 'players';
    s.energy = 3;
    s.speed = 10;
    await frame(p);
    expect([s.group, s.energy, s.speed, s.x]).toEqual(['players', 3, 10, 0]);
  });

  it('SPR-8..SPR-10: position and velocity are owned vectors with aliases', async () => {
    const p = await makeInstance();
    const s = p.createSprite(3, 4);
    const position = s.position;
    const velocity = s.velocity;
    s.x = 10;
    s.y = 20;
    s.velocityX = 1;
    s.velocityY = 2;
    expect([position.x, position.y, velocity.x, velocity.y]).toEqual([
      10, 20, 1, 2,
    ]);
    s.velocity.y = 5;
    expect(s.velocityY).toBe(5);
    await frame(p);
    expect(s.position).toBe(position);
    expect(s.velocity).toBe(velocity);
    expect(position.dist((p as unknown as p5).createVector(11, 25))).toBe(0);
  });

  it('SPR-11, SPR-12: rotation is stored as given; speed and direction do not move', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0) as Sprite & {
      speed: number;
      direction: number;
    };
    s.rotation = 725;
    s.speed = 5;
    s.direction = 90;
    await frame(p);
    expect(s.rotation).toBe(725);
    expect([s.x, s.y]).toEqual([0, 0]);
  });

  it('SPR-13, S14: getSpeed and getDirection', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    s.velocity.x = 0;
    s.velocity.y = -5;
    expect(s.getSpeed()).toBe(5);
    expect(s.getDirection()).toBe(-90);
    s.velocity.y = 0;
    expect(s.getDirection()).toBe(0);
  });

  it('SPR-14, S4: mirrorX and mirrorY', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    expect(s.mirrorX(-1)).toBeUndefined();
    expect(s.mirrorX()).toBe(-1);
    expect(s.mirrorX(2)).toBe(-1);
    expect(s.mirrorX()).toBe(-1);
    expect(s.mirrorX(0)).toBe(-1);
    expect(s.mirrorY(-1)).toBeUndefined();
    expect(s.mirrorY()).toBe(-1);
  });

  it('SPR-15: mirroring changes neither size nor scale', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0, 30, 40);
    s.mirrorX(-1);
    s.mirrorY(-1);
    expect([s.width, s.height, s.scale]).toEqual([30, 40, 1]);
  });

  it('SPR-16, SPR-17: depth is assignable; an invisible sprite still updates and counts', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0);
    s.depth = 2.5;
    s.visible = false;
    s.velocity.x = 2;
    await frame(p);
    expect(s.x).toBe(2);
    expect(p.createSprite().depth).toBe(3.5);
  });

  it('SPR-20, SPR-21: width and height without an animation set the natural size', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0, 30, 40);
    s.width = 60;
    s.height = 10;
    expect([s.width, s.height]).toEqual([60, 10]);
    s.scale = 2;
    expect([s.getScaledWidth(), s.getScaledHeight()]).toEqual([120, 20]);
  });

  it('SPR-22, SPR-23: scale multiplies scaled size but not width or height', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    s.scale = -0.5;
    expect([s.width, s.height]).toEqual([100, 100]);
    expect(s.getScaledWidth()).toBe(-50);
    s.scale = 0;
    expect(s.getScaledHeight()).toBe(0);
  });

  describe('with costumes', () => {
    async function setup(): Promise<SpriteP5> {
      const p = await makeInstance();
      p.predefinedAnimations = {
        '40x20': makeImage(p, 40, 20),
        '50x80': makeImage(p, 50, 80),
        '200x100': makeImage(p, 200, 100),
        '20x20': makeImage(p, 20, 20),
      };
      return p;
    }

    it('CMP-5, SPR-24, S23: attaching sizes by the frame times the effective scale', async () => {
      const p = await setup();
      const a = p.createSprite();
      a.setAnimation('200x100');
      expect([a.width, a.height]).toEqual([200, 100]);
      const b = p.createSprite();
      b.scale = 3;
      b.setAnimation('50x80');
      expect([b.width, b.height]).toEqual([150, 240]);
    });

    it('SPR-21, S21, S22: width with an animation sets the stretch, which survives a new costume', async () => {
      const p = await setup();
      const s = p.createSprite(0, 0);
      s.setAnimation('50x80');
      s.scale = 0.5;
      s.width = 100;
      expect([s.width, s.height, s.getScaledWidth()]).toEqual([100, 80, 50]);
      s.setAnimation('200x100');
      expect([s.width, s.height]).toEqual([400, 50]);
      expect([s.getScaledWidth(), s.getScaledHeight()]).toEqual([200, 25]);
      const calls = draw(p, s);
      expect(calls).toContainEqual(['scale', 1, 0.5]);
    });

    it('SPR-25: a frame of a different size does not resize the sprite', async () => {
      const p = await setup();
      p.predefinedAnimations!.mixed = new Animation(
        makeImage(p, 10, 10),
        makeImage(p, 30, 60),
      );
      const s = p.createSprite();
      s.setAnimation('mixed');
      s.animation!.frameDelay = 1;
      await frame(p);
      expect(s.animation!.getFrame()).toBe(1);
      expect([s.width, s.height]).toEqual([10, 10]);
    });

    it('CMP-6, SPR-26: setNaturalSize sets the natural size and keeps the stretch', async () => {
      const p = await setup();
      const s = p.createSprite();
      s.setAnimation('50x80');
      s.width = 100;
      s.setNaturalSize(25, 40);
      expect([s.width, s.height]).toEqual([50, 40]);
    });

    it('SPR-28, SPR-29, S25: runtime creation with a costume', async () => {
      const p = await setup();
      p.predefinedAnimations!.big = makeImage(p, 200, 100);
      const s = runtimeAddSprite(p, {
        animation: 'big',
        location: {x: 30, y: 40},
      });
      expect([s.x, s.y, s.id, s.speed, s.direction]).toEqual([30, 40, 0, 5, 0]);
      expect([s.rotation, s.lifetime, s.baseScale, s.scale]).toEqual([
        0, -1, 0.5, 0.5,
      ]);
      expect([s.width, s.height, s.getScale(), s.getScaledHeight()]).toEqual([
        200, 100, 1, 50,
      ]);
      expect(s.depth).toBe(1);
      expect((s as unknown as Record<string, unknown>).group).toBeUndefined();
      expect((s as unknown as Record<string, unknown>).name).toBeUndefined();
    });

    it('CMP-5, SPR-24, SPR-29, S26, S27, S28: a costume change on a scaled sprite', async () => {
      const p = await setup();
      p.predefinedAnimations!.big = makeImage(p, 200, 100);
      const s = runtimeAddSprite(p, {animation: 'big'});
      s.setScale(0.5);
      expect(s.scale).toBe(0.25);
      runtimeSetAnimation(s, '50x80');
      expect([s.baseScale, s.scale, s.width, s.height]).toEqual([
        1, 0.5, 12.5, 20,
      ]);
      expect([s.getScale(), s.getScaledHeight()]).toEqual([0.5, 10]);
      // S27: setProp width 100%, as the runtime computes it.
      s.width = s.animation!.getWidth() * s.baseScale;
      expect([s.width, s.height]).toEqual([50, 20]);
      expect(draw(p, s)).toContainEqual(['scale', 2, 0.5]);
      runtimeSetAnimation(s, '50x80');
      expect([s.width, s.scale]).toEqual([50, 0.5]);
    });

    it('S29, S30: runtime creation with a small costume and with none', async () => {
      const p = await setup();
      p.predefinedAnimations!.tiny = makeImage(p, 20, 20);
      const t = runtimeAddSprite(p, {animation: 'tiny'});
      expect([t.x, t.y, t.baseScale, t.scale, t.width]).toEqual([
        200, 200, 1, 1, 20,
      ]);
      const u = runtimeAddSprite(p, {});
      expect([u.baseScale, u.scale, u.width]).toEqual([1, 1, 100]);
      expect(u.getAnimationLabel()).toBe('');
    });

    it('SPR-30, S24: setAnimation with an unknown name throws', async () => {
      const p = await setup();
      const s = p.createSprite();
      expect(() => s.setAnimation('nope')).toThrow(
        new Error(
          'Unable to find an animation named "nope".  Please make sure the animation exists.',
        ),
      );
      p.predefinedAnimations = undefined;
      expect(() => s.setAnimation('40x20')).toThrow(Error);
    });

    it('SPR-30: the same name does nothing; a new name makes a fresh animation', async () => {
      const p = await setup();
      const s = p.createSprite();
      s.setAnimation('40x20');
      const first = s.animation;
      s.setAnimation('40x20');
      expect(s.animation).toBe(first);
      s.setAnimation('50x80');
      s.setAnimation('40x20');
      expect(s.animation).not.toBe(first);
      expect(s.getAnimationLabel()).toBe('40x20');
    });

    it('SPR-30: the paused-by-default flag stops the new animation', async () => {
      const p = await setup();
      p.predefinedAnimations!.walk = new Animation(
        makeImage(p, 10, 10),
        makeImage(p, 10, 10),
      );
      p.pauseAnimationsByDefault = true;
      const s = p.createSprite();
      s.setAnimation('walk');
      expect(s.animation!.playing).toBe(false);
    });

    it('SPR-52, SPR-53, S15: drawing a costume', async () => {
      const p = await setup();
      const s = p.createSprite(50, 60);
      s.setAnimation('40x20');
      s.scale = 0.5;
      s.mirrorY(-1);
      const image = p.predefinedAnimations!['40x20'];
      expect(draw(p, s)).toEqual([
        ...DRAW_PREAMBLE,
        ['translate', 50, 60],
        ['rotate', 0],
        ['scale', 0.5, -0.5],
        ['image', image, 0, 0, 40, 20],
        ['pop'],
      ]);
    });

    it('SPR-54, S16: a tinted costume is drawn inside its own push and pop', async () => {
      const p = await setup();
      const s = p.createSprite(50, 60);
      s.setAnimation('40x20');
      s.scale = 0.5;
      s.mirrorY(-1);
      s.tint = 'blue';
      const calls = draw(p, s);
      const image = p.predefinedAnimations!['40x20'];
      expect(calls.slice(0, 9)).toEqual([
        ...DRAW_PREAMBLE,
        ['translate', 50, 60],
        ['rotate', 0],
        ['scale', 0.5, -0.5],
      ]);
      expect(calls[9]).toEqual(['push']);
      expect(calls[10][0]).toBe('image');
      // ANI-34: the library tints a copy; p5's own tint is not used.
      expect(calls[10][1]).not.toBe(image);
      expect(calls[10].slice(2)).toEqual([0, 0, 40, 20]);
      expect(calls.slice(11)).toEqual([['pop'], ['pop']]);
    });

    it('SPR-21, S17: widening a costume stretches the drawing', async () => {
      const p = await setup();
      const s = p.createSprite(50, 60);
      s.setAnimation('40x20');
      s.scale = 0.5;
      s.mirrorY(-1);
      s.width = 80;
      expect([s.width, s.height, s.getScaledWidth()]).toEqual([80, 20, 40]);
      expect(draw(p, s)).toContainEqual(['scale', 1, -0.5]);
    });
  });

  it('SPR-41, S6: three frames of velocity', async () => {
    const p = await makeInstance();
    const s = p.createSprite(100, 100);
    s.velocity.x = 3;
    s.velocity.y = 4;
    const seen: number[][] = [];
    for (let i = 0; i < 3; i++) {
      await frame(p);
      seen.push([s.x, s.y]);
    }
    expect(seen).toEqual([
      [103, 104],
      [106, 108],
      [109, 112],
    ]);
    expect([s.deltaX, s.deltaY]).toEqual([3, 4]);
    expect([s.previousPosition.x, s.previousPosition.y]).toEqual([106, 108]);
  });

  it('SPR-41, S7: an assignment between updates does not move the previous position', async () => {
    const p = await makeInstance();
    const s = p.createSprite(50, 0);
    s.velocity.x = 1;
    await frame(p);
    expect(s.x).toBe(51);
    s.x = 70;
    await frame(p);
    expect([s.x, s.previousPosition.x, s.deltaX]).toEqual([71, 51, 20]);
  });

  it('SPR-46, S8: lifetime 3 over four frames', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    s.lifetime = 3;
    const seen: unknown[] = [];
    for (let i = 0; i < 4; i++) {
      await frame(p);
      seen.push([s.lifetime, s.removed, p.allSprites.contains(s)]);
    }
    expect(seen).toEqual([
      [2, false, true],
      [1, false, true],
      [0, true, false],
      [0, true, false],
    ]);
  });

  it('SPR-46, S9, S32: lifetime 0 and a lifetime that runs out', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    s.lifetime = 0;
    await frame(p);
    expect([s.lifetime, s.removed]).toEqual([0, true]);
    const t = p.createSprite();
    t.lifetime = 2;
    await frames(p, 2);
    expect([t.lifetime, t.removed]).toEqual([0, true]);
  });

  it('CMP-7, SPR-46, S10: a fractional lifetime never expires', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    s.life = 2.5;
    const seen: number[] = [];
    for (let i = 0; i < 4; i++) {
      await frame(p);
      seen.push(s.lifetime);
    }
    expect(seen).toEqual([1.5, 0.5, -0.5, -0.5]);
    expect(s.removed).toBe(false);
  });

  it('SPR-46: a sprite removed by its lifetime is not drawn that frame', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    s.lifetime = 1;
    let calls: Call[] = [];
    await frame(p, () => {
      const stop = recordP5(p);
      p.drawSprites();
      calls = stop();
    });
    expect(calls).toEqual([]);
    expect(s.removed).toBe(true);
  });

  it('SPR-36, SPR-37, S11: a removed sprite is neither updated nor drawn', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0);
    s.velocity.x = 1;
    s.remove();
    await frame(p);
    expect(s.x).toBe(0);
    expect(draw(p, s)).toEqual([]);
    s.x = 5;
    expect(s.x).toBe(5);
    expect(p.allSprites.contains(s)).toBe(false);
  });

  it('SPR-36: destroy is remove; removal visits groups in joining order and is idempotent', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    expect(s.destroy).toBe(s.remove);
    const g = p.createGroup();
    const h = p.createGroup();
    g.add(s);
    h.add(s);
    const visited: string[] = [];
    const watch = (group: typeof g, name: string) => {
      const remove = group.remove.bind(group);
      group.remove = sprite => {
        visited.push(name);
        return remove(sprite);
      };
    };
    watch(p.allSprites, 'all');
    watch(g, 'g');
    watch(h, 'h');
    s.destroy();
    expect(visited).toEqual(['all', 'g', 'h']);
    expect(s.groups).toEqual([]);
    s.remove();
    expect(visited).toEqual(['all', 'g', 'h']);
  });

  it('SPR-17, S12: an invisible sprite still moves', async () => {
    const p = await makeInstance();
    const s = p.createSprite(0, 0);
    s.visible = false;
    s.velocity.x = 2;
    await frame(p);
    expect(s.x).toBe(2);
  });

  it('SPR-38, S13: a sprite taken out of allSprites is not updated or drawn', async () => {
    const p = await makeInstance();
    const s = p.createSprite(5, 0);
    s.velocity.x = 1;
    p.allSprites.remove(s);
    let calls: Call[] = [];
    await frame(p, () => {
      const stop = recordP5(p);
      p.drawSprites();
      calls = stop();
    });
    expect([s.x, s.removed, s.groups.length]).toEqual([5, false, 0]);
    expect(calls).toEqual([]);
  });

  it('SPR-44, SPR-47: the update advances the animation, visible or not', async () => {
    const p = await makeInstance();
    p.predefinedAnimations = {
      two: new Animation(makeImage(p, 5, 5), makeImage(p, 5, 5)),
    };
    const s = p.createSprite();
    s.setAnimation('two');
    s.animation!.frameDelay = 1;
    s.visible = false;
    await frame(p);
    expect(s.animation!.getFrame()).toBe(1);
  });

  it('SPR-51, SPR-52, SPR-55, S18: drawing the placeholder', async () => {
    const p = await makeInstance();
    const s = p.createSprite(10, 20);
    s.rotation = 30;
    s.scale = 2;
    s.mirrorX(-1);
    const calls = draw(p, s);
    expect(calls.slice(0, 9)).toEqual([
      ...DRAW_PREAMBLE,
      ['translate', 10, 20],
      ['rotate', 30],
      ['scale', -2, 2],
    ]);
    const fill = calls[9][1] as p5.Color;
    expect(calls[9][0]).toBe('fill');
    expect([p.red(fill), p.green(fill), p.blue(fill), p.alpha(fill)]).toEqual([
      127, 127, 127, 255,
    ]);
    expect(calls.slice(10)).toEqual([['rect', 0, 0, 100, 100], ['pop']]);
  });

  it('SPR-51: drawing leaves p5 state unchanged', async () => {
    const p = await makeInstance();
    const s = p.createSprite(10, 20);
    s.rotation = 30;
    const before = context2d(p).getTransform().toString();
    p.fill(1, 2, 3);
    const fill = String(context2d(p).fillStyle);
    s.display();
    expect(context2d(p).getTransform().toString()).toBe(before);
    expect(String(context2d(p).fillStyle)).toBe(fill);
    expect(p.angleMode()).toBe(p.DEGREES);
  });

  it('SPR-56, S19: a tinted placeholder is half way to the tint', async () => {
    const p = await makeInstance();
    const s = p.createSprite(10, 20);
    s.tint = '#ff0000';
    const calls = draw(p, s);
    const fill = calls.find(call => call[0] === 'fill')!;
    expect(fill.slice(1)).toEqual([191, 64, 64, 255]);
  });

  it('SPR-50, SPR-58, S20: an invisible sprite makes no p5 calls; a null tint is no tint', async () => {
    const p = await makeInstance();
    const s = p.createSprite();
    s.visible = false;
    s.debug = true;
    expect(draw(p, s)).toEqual([]);
    s.visible = true;
    s.debug = false;
    s.tint = null;
    const fill = draw(p, s).find(call => call[0] === 'fill')!;
    expect(p.red(fill[1] as p5.Color)).toBe(127);
  });

  it('SPR-57, S33: the debug overlay follows the body in camera space', async () => {
    const p = await makeInstance();
    const s = p.createSprite(10, 20);
    s.depth = 3.5;
    s.rotation = 90;
    s.debug = true;
    const calls = draw(p, s);
    const bodyPop = calls.findIndex(call => call[0] === 'pop');
    expect(calls.slice(bodyPop + 1)).toEqual([
      ['push'],
      ['stroke', 0, 255, 0],
      ['strokeWeight', 1],
      ['line', 0, 20, 20, 20],
      ['line', 10, 10, 10, 30],
      ['noStroke'],
      ['fill', 0, 255, 0],
      ['textSize', 16],
      ['textAlign', 'left', 'bottom'],
      ['text', '3.5', 14, 18],
      ['stroke', 0, 255, 0],
      ['noFill'],
      ['pop'],
    ]);
  });
});
