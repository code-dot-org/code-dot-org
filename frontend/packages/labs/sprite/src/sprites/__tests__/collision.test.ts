import {describe, expect, it, vi} from 'vitest';

import {pointBox, separation} from '../collision/box';
import {type Collider, ensureCollider} from '../collision/collider';
import type {Sprite} from '../Sprite';
import type {SpriteP5} from '../types';

import {makeImage, makeInstance, pointer, recordP5, setMouse} from './harness';

function pos(s: Sprite): [number, number] {
  return [s.x, s.y];
}

function vel(s: Sprite): [number, number] {
  return [s.velocity.x, s.velocity.y];
}

function flags(s: Sprite): string[] {
  return (['left', 'right', 'top', 'bottom'] as const).filter(
    side => s.touching[side],
  );
}

function withAnimation(
  p: SpriteP5,
  s: Sprite,
  width: number,
  height: number,
  label = 'x',
): Sprite {
  s.addAnimation(label, new p.Animation(makeImage(p, width, height)));
  return s;
}

function prime(...sprites: Sprite[]): void {
  for (const s of sprites) {
    ensureCollider(s);
  }
}

function update(...sprites: Sprite[]): void {
  for (const s of sprites) {
    s.update();
  }
}

/** Whether A overlaps a fresh B at each position. */
function overlapsAt(
  p: SpriteP5,
  a: Sprite,
  positions: [number, number][],
  size: [number, number] = [100, 100],
): boolean[] {
  return positions.map(([x, y]) => {
    const b = p.createSprite(x, y, size[0], size[1]);
    const result = a.overlap(b);
    b.remove();
    return result;
  });
}

function pressed(p: SpriteP5, mouse: boolean, touch = false): void {
  pointer(p).mouseIsPressed = mouse;
  pointer(p).touchIsDown = touch;
}

describe('collision.md: colliders', () => {
  it('COL-3: no collider at creation or after updates; a check creates both', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(500, 0);
    update(a, b);
    expect(a.collider).toBeUndefined();
    expect(a.overlap(b)).toBe(false);
    expect(a.collider).toBeDefined();
    expect(b.collider).toBeDefined();
  });

  it('COL-3, COL-24: mouseIsOver creates the collider (row 90)', async () => {
    const p = await makeInstance();
    const s = p.createSprite(200, 200);
    setMouse(p, 0, 0);
    expect(p.mouseIsOver(s)).toBe(false);
    expect(s.collider).toBeDefined();
  });

  it('CMP-40, COL-4, COL-27: deliberate deviation from the fork: a 1x1 costume collides and is hit-tested (rows 44, 45)', async () => {
    const p = await makeInstance();
    const a = withAnimation(p, p.createSprite(0, 0), 1, 1);
    const b = p.createSprite(0, 0);
    expect(a.overlap(b)).toBe(true);
    expect(b.overlap(a)).toBe(true);
    expect(a.collider).toBeDefined();
    const c = withAnimation(p, p.createSprite(0, 0), 1, 1);
    setMouse(p, 0, 0);
    expect(p.mouseIsOver(c)).toBe(true);
    setMouse(p, 0.5, 0);
    expect(p.mouseIsOver(c)).toBe(false);
    pressed(p, true);
    setMouse(p, 0, 0);
    expect(p.mousePressedOver(c)).toBe(true);
  });

  it('COL-5, COL-6: animation size, scale and stretch (rows 37, 38, 39, 41)', async () => {
    const p = await makeInstance();
    const a = withAnimation(p, p.createSprite(0, 0), 50, 80);
    expect(
      overlapsAt(p, a, [
        [74, 0],
        [0, 89],
        [0, 90],
      ]),
    ).toEqual([true, true, false]);
    expect([a.width, a.height]).toEqual([50, 80]);

    const scaled = withAnimation(p, p.createSprite(0, 0), 50, 80);
    scaled.scale = 2;
    expect(
      overlapsAt(p, scaled, [
        [99, 0],
        [100, 0],
      ]),
    ).toEqual([true, false]);

    const stretched = withAnimation(p, p.createSprite(0, 0), 50, 80);
    stretched.width = 100;
    expect(stretched.width).toBe(100);
    expect(
      overlapsAt(p, stretched, [
        [75, 0],
        [99, 0],
        [100, 0],
      ]),
    ).toEqual([true, true, false]);

    const wide = withAnimation(p, p.createSprite(0, 0), 200, 100);
    wide.scale = 0.5;
    expect(
      overlapsAt(p, wide, [
        [99, 0],
        [100, 0],
        [0, 74],
        [0, 75],
      ]),
    ).toEqual([true, false, true, false]);
  });

  it('COL-6: mirroring does not affect the collider (row 36)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    a.mirrorX(-1);
    a.mirrorY(-1);
    expect(
      overlapsAt(p, a, [
        [99, 0],
        [100, 0],
      ]),
    ).toEqual([true, false]);
  });

  it('COL-6, COL-7: scale, including negative (rows 31, 32)', async () => {
    const p = await makeInstance();
    for (const scale of [0.5, -0.5]) {
      const a = p.createSprite(0, 0);
      a.scale = scale;
      expect(
        overlapsAt(p, a, [
          [74, 0],
          [75, 0],
        ]),
      ).toEqual([true, false]);
    }
  });

  it('COL-7: the rotated box of the by-hand example', () => {
    const t = (30 * Math.PI) / 180;
    const box = {
      x: 0,
      y: 0,
      wx: 100 * Math.cos(t),
      wy: 100 * Math.sin(t),
      hx: -20 * Math.sin(t),
      hy: 20 * Math.cos(t),
    };
    expect(separation(pointBox(34.64, 20), box).overlaps).toBe(true);
    expect(separation(pointBox(34.64, -20), box).overlaps).toBe(false);
  });

  it('COL-5, COL-8: base dimensions are read at the next refresh (rows 40, 42, 43)', async () => {
    const p = await makeInstance();
    const a = withAnimation(p, p.createSprite(0, 0), 50, 80);
    const b = p.createSprite(63, 0);
    expect(a.overlap(b)).toBe(true);
    a.scale = 0.5;
    expect(a.overlap(b)).toBe(false);

    const c = withAnimation(p, p.createSprite(0, 0), 50, 80, 'x');
    c.addAnimation('y', new p.Animation(makeImage(p, 20, 20)));
    const d = p.createSprite(60, 0);
    expect(c.overlap(d)).toBe(true);
    c.changeAnimation('y');
    expect(c.overlap(d)).toBe(false);

    const e = p.createSprite(0, 0);
    const f = p.createSprite(71, 0);
    expect(e.overlap(f)).toBe(true);
    e.width = 40;
    expect(e.overlap(f)).toBe(false);
  });

  it('CMP-16, COL-8, COL-24: mouseIsOver does not refresh; the update does (rows 93, 137 example)', async () => {
    const p = await makeInstance();
    const s = p.createSprite(200, 200);
    setMouse(p, 200, 200);
    expect(p.mouseIsOver(s)).toBe(true);
    s.x = 400;
    expect(p.mouseIsOver(s)).toBe(true);
    s.update();
    expect(p.mouseIsOver(s)).toBe(false);
  });

  it('CMP-17, COL-8, COL-19: displace does not refresh B (row 94)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    expect(a.displace(b)).toBe(true);
    expect(pos(b)).toEqual([100, 0]);
    setMouse(p, 45, 0);
    expect(p.mouseIsOver(b)).toBe(true);
    b.update();
    expect(p.mouseIsOver(b)).toBe(false);
  });

  it('COL-8 item 4: collide refreshes A (row 95)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    a.collide(b);
    expect(pos(a)).toEqual([-10, 0]);
    setMouse(p, -55, 0);
    expect(p.mouseIsOver(a)).toBe(true);
  });
});

describe('collision.md: the separating-axis test', () => {
  it('CMP-19, COL-12, COL-14: touching boxes do not overlap; no tolerance (rows 1, 2, 3, 25)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(100, 0);
    expect(a.overlap(b)).toBe(false);
    expect(b.overlap(a)).toBe(false);
    expect(
      overlapsAt(p, a, [
        [99.999, 0],
        [100, 100],
        [99.99999999, 0],
      ]),
    ).toEqual([true, false, true]);
  });

  it('COL-12, COL-18: collide moves A along the shortest axis (rows 4, 5, 6)', async () => {
    const p = await makeInstance();
    const cases: [[number, number], [number, number], string[]][] = [
      [[99, 0], [-1, 0], ['right']],
      [[-99, 0], [1, 0], ['left']],
      [[0, 90], [0, -10], ['bottom']],
    ];
    for (const [at, moved, sides] of cases) {
      const a = p.createSprite(0, 0);
      const b = p.createSprite(...at);
      expect(a.collide(b)).toBe(true);
      expect(pos(a)).toEqual(moved);
      expect(pos(b)).toEqual(at);
      expect(flags(a)).toEqual(sides);
    }
  });

  it('CMP-20, COL-12: ties go to the first axis; coincident centres (rows 8..13)', async () => {
    const p = await makeInstance();
    const cases: [
      [number, number],
      [number, number],
      [number, number],
      [number, number],
    ][] = [
      [
        [100, 100],
        [50, 50],
        [-50, 0],
        [100, 100],
      ],
      [
        [100, 100],
        [-50, -50],
        [50, 0],
        [100, 100],
      ],
      [
        [100, 100],
        [60, 60],
        [-40, 0],
        [100, 100],
      ],
      [
        [100, 100],
        [0, 0],
        [-100, 0],
        [100, 100],
      ],
      [
        [40, 60],
        [0, 0],
        [-70, 0],
        [100, 100],
      ],
      [
        [50, 50],
        [60, 0],
        [-15, 0],
        [100, 20],
      ],
      [
        [50, 50],
        [10, 30],
        [0, -5],
        [100, 20],
      ],
    ];
    for (const [sizeA, at, moved, sizeB] of cases) {
      const a = p.createSprite(0, 0, ...sizeA);
      const b = p.createSprite(...at, ...sizeB);
      expect(a.collide(b)).toBe(true);
      expect(pos(a)).toEqual(moved);
      expect(pos(b)).toEqual(at);
    }
  });

  it('COL-12, COL-19: displace pushes B (rows 7, 12)', async () => {
    const p = await makeInstance();
    for (const [at, pushed] of [
      [
        [90, 0],
        [100, 0],
      ],
      [
        [0, 0],
        [100, 0],
      ],
    ] as [number, number][][]) {
      const a = p.createSprite(0, 0);
      const b = p.createSprite(at[0], at[1]);
      expect(a.displace(b)).toBe(true);
      expect(pos(a)).toEqual([0, 0]);
      expect(pos(b)).toEqual(pushed);
    }
  });

  it('COL-11, COL-12: a 40x60 box (row 16)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0, 40, 60);
    expect(
      overlapsAt(p, a, [
        [69, 0],
        [70, 0],
        [0, 79],
        [0, 80],
      ]),
    ).toEqual([true, false, true, false]);
  });

  it('COL-10, COL-11: rotated boxes (rows 26..30)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    a.rotation = 45;
    const b = p.createSprite(110, 0);
    expect(a.collide(b)).toBe(true);
    expect(a.x).toBeCloseTo(-10.710678, 6);
    expect(a.y).toBeCloseTo(0, 9);

    const c = p.createSprite(0, 0);
    c.rotation = 45;
    expect(
      overlapsAt(p, c, [
        [120, 0],
        [121, 0],
      ]),
    ).toEqual([true, false]);

    const d = p.createSprite(0, 0);
    const e = p.createSprite(90, 90);
    d.rotation = 45;
    e.rotation = 45;
    expect(d.collide(e)).toBe(false);

    const f = p.createSprite(0, 0);
    f.rotation = 30;
    const g = p.createSprite(100, 20);
    expect(f.collide(g)).toBe(true);
    expect(f.x).toBeCloseTo(-18.30127, 5);
    expect(f.y).toBeCloseTo(0, 9);

    const h = p.createSprite(0, 0, 100, 20);
    h.rotation = 90;
    expect(
      overlapsAt(
        p,
        h,
        [
          [0, 55],
          [0, 54],
        ],
        [10, 10],
      ),
    ).toEqual([false, true]);
  });

  it('COL-13: a collapsed box is a point (rows 33, 34, 35)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    a.scale = 0;
    expect(
      overlapsAt(p, a, [
        [0, 0],
        [10, 0],
        [49, 0],
        [50, 0],
      ]),
    ).toEqual([true, true, true, false]);
    const b = p.createSprite(0, 0);
    expect(b.overlap(a)).toBe(true);
    b.remove();
    const c = p.createSprite(10, 5);
    expect(a.collide(c)).toBe(true);
    expect(pos(a)).toEqual([-40, 0]);
  });

  it('COL-13: two collapsed boxes never overlap', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(0, 0);
    a.scale = 0;
    b.scale = 0;
    expect(a.overlap(b)).toBe(false);
  });
});

describe('collision.md: collision methods', () => {
  it('COL-17, COL-18: flags are reset on every call (row 17)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    const c = p.createSprite(500, 0);
    expect(a.overlap(b)).toBe(true);
    expect(flags(a)).toEqual(['right']);
    expect(a.overlap(c)).toBe(false);
    expect(flags(a)).toEqual([]);
  });

  it('COL-17, COL-12: boundary contact sets no flag', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(100, 0);
    expect(a.overlap(b)).toBe(false);
    expect(flags(a)).toEqual([]);
  });

  it('COL-17, COL-19: overlap moves nothing (row 18)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(50, 0);
    expect(a.overlap(b)).toBe(true);
    expect(pos(a)).toEqual([0, 0]);
    expect(pos(b)).toEqual([50, 0]);
  });

  it('COL-19: self, removed B and removed A (rows 19, 20, 21)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    expect(a.overlap(a)).toBe(false);
    const b = p.createSprite(10, 0);
    b.remove();
    expect(a.overlap(b)).toBe(false);
    const c = p.createSprite(20, 0);
    a.touching.top = true;
    a.remove();
    expect(a.overlap(c)).toBe(false);
    expect(flags(a)).toEqual([]);
    expect(c.overlap(a)).toBe(false);
  });

  it('CMP-39, COL-23: deliberate deviation from the fork: an Error, not a bare string, after the flags are reset (row 22)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    a.touching.left = true;
    let thrown: unknown;
    try {
      a.overlap({x: 1} as unknown as Sprite);
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeInstanceOf(Error);
    expect(String(thrown)).toBe(
      'Error: overlap can only be checked between sprites or groups',
    );
    expect(flags(a)).toEqual([]);
    const g = p.createGroup();
    g.add(a);
    expect(() => a.collide(undefined as unknown as Sprite)).toThrow(
      'overlap can only be checked between sprites or groups',
    );
  });

  it('COL-17: plain arrays; isTouching is overlap (rows 23, 24)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(10, 0);
    expect(a.overlap([b])).toBe(true);
    expect(a.isTouching === a.overlap).toBe(true);
    const cb = vi.fn();
    expect(a.isTouching(b, cb)).toBe(true);
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('COL-17: pairs run in order and see earlier moves (example, row 47)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    const d = p.createSprite(0, 95);
    expect(a.collide([b, d])).toBe(true);
    expect(pos(a)).toEqual([-10, -5]);
    expect(flags(a)).toEqual(['right', 'bottom']);

    const a2 = p.createSprite(0, 0);
    const g = p.createGroup();
    g.add(p.createSprite(90, 0));
    g.add(p.createSprite(0, 95));
    expect(a2.collide(g)).toBe(true);
    expect(pos(a2)).toEqual([-10, -5]);
  });

  it('COL-17, COL-19: every pair runs; callback per overlapping pair (row 46)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const g = p.createGroup();
    const b = p.createSprite(90, 0);
    const c = p.createSprite(500, 0);
    const d = p.createSprite(0, 95);
    g.add(b);
    g.add(c);
    g.add(d);
    const cb = vi.fn();
    expect(a.overlap(g, cb)).toBe(true);
    expect(cb).toHaveBeenCalledTimes(2);
    expect(cb.mock.calls).toEqual([
      [a, b],
      [a, d],
    ]);
    expect(flags(a)).toEqual(['right', 'bottom']);
    expect(pos(a)).toEqual([0, 0]);
  });

  it('COL-19 step 8: callback this and arguments; runs after the move (rows 48, 49)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(10, 0);
    const calls: unknown[][] = [];
    a.overlap(b, function (this: Sprite, ...rest: Sprite[]) {
      calls.push([this, ...rest]);
    });
    expect(calls).toEqual([[a, a, b]]);

    const c = p.createSprite(0, 0);
    const d = p.createSprite(90, 0);
    let seen: [number, number] | undefined;
    c.collide(d, () => {
      seen = pos(c);
    });
    expect(seen).toEqual([-10, 0]);
  });

  it('CMP-22, COL-17, Open question 12: a callback that removes shifts the live length', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const g = p.createGroup();
    const b = p.createSprite(10, 0);
    const c = p.createSprite(20, 0);
    const d = p.createSprite(30, 0);
    g.add(b);
    g.add(c);
    g.add(d);
    const seen: Sprite[] = [];
    a.overlap(g, (_self, other) => {
      seen.push(other);
      other.remove();
    });
    expect(seen).toEqual([b, d]);
  });

  it('COL-22: group methods; isTouching of a group with itself (rows 50, 51)', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(500, 0);
    g.add(a);
    g.add(b);
    const t = p.createSprite(10, 0);
    expect(g.overlap(t)).toBe(true);
    expect(g.isTouching(g)).toBe(false);
    expect(g.isTouching === g.overlap).toBe(true);

    const h = p.createGroup();
    const c = p.createSprite(0, 0);
    const d = p.createSprite(90, 0);
    h.add(c);
    h.add(d);
    const u = p.createSprite(45, 90);
    expect(h.collide(u)).toBe(true);
    expect(pos(c)).toEqual([0, -10]);
    expect(pos(d)).toEqual([90, -10]);
    expect(pos(u)).toEqual([45, 90]);
  });

  it('COL-22: no short-circuit; every member is tested', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(300, 0);
    g.add(a);
    g.add(b);
    const t = p.createGroup();
    t.add(p.createSprite(50, 0));
    t.add(p.createSprite(350, 0));
    const cb = vi.fn();
    expect(g.displace(t, cb)).toBe(true);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('COL-19, COL-17: a removed member in the target is skipped (row 52)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const g = p.createGroup();
    const b = p.createSprite(10, 0);
    const c = p.createSprite(20, 0);
    g.add(b);
    g.add(c);
    b.remove();
    const cb = vi.fn();
    expect(a.overlap(g, cb)).toBe(true);
    expect(cb).toHaveBeenCalledTimes(1);
    expect(g.length).toBe(1);
  });

  it('CMP-21, COL-22: the functions stay bound to their group (row 53, example)', async () => {
    const p = await makeInstance();
    const g = p.createGroup();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(10, 0);
    g.add(a);
    g.add(b);
    const sub = [p.createSprite(500, 0)] as Sprite[] & {
      isTouching?: typeof g.isTouching;
    };
    sub.isTouching = g.isTouching;
    expect(sub.isTouching([b])).toBe(true);
    expect(sub.isTouching([p.createSprite(1000, 0)])).toBe(false);
  });

  it('COL-22: allSprites and edges have the methods', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    for (const group of [p.allSprites, edges]) {
      for (const name of [
        'overlap',
        'isTouching',
        'collide',
        'displace',
        'bounce',
        'bounceOff',
      ] as const) {
        expect(typeof group[name]).toBe('function');
      }
      expect(Object.keys(group).every(key => /^\d+$/.test(key))).toBe(true);
    }
  });
});

describe('collision.md: immovable and velocity', () => {
  it('COL-21: immovable A is not moved; immovable B is not pushed (rows 54, 55)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    a.immovable = true;
    const cb = vi.fn();
    expect(a.collide(b, cb)).toBe(true);
    expect(pos(a)).toEqual([0, 0]);
    expect(pos(b)).toEqual([90, 0]);
    expect(flags(a)).toEqual(['right']);
    expect(cb).toHaveBeenCalledTimes(1);

    const c = p.createSprite(0, 0);
    const d = p.createSprite(90, 0);
    d.immovable = true;
    expect(c.displace(d)).toBe(true);
    expect(pos(c)).toEqual([0, 0]);
    expect(pos(d)).toEqual([90, 0]);
  });

  it('COL-20: bounce off an immovable B; both immovable (rows 56, 57)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    b.immovable = true;
    expect(a.bounce(b)).toBe(true);
    expect(pos(a)).toEqual([-10, 0]);
    expect(b.immovable).toBe(true);

    const c = p.createSprite(0, 0);
    const d = p.createSprite(90, 0);
    c.immovable = true;
    d.immovable = true;
    expect(c.bounce(d)).toBe(true);
    expect([pos(c), pos(d), vel(c), vel(d)]).toEqual([
      [0, 0],
      [90, 0],
      [0, 0],
      [0, 0],
    ]);
  });

  it('COL-16, COL-20: velocity without an update (rows 58, 59, 60, 61)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    a.velocity.x = 3;
    const b = p.createSprite(90, 0);
    expect(a.collide(b)).toBe(true);
    expect(pos(a)).toEqual([-10, 0]);
    expect(vel(a)).toEqual([0, 0]);

    const c = p.createSprite(0, 0);
    c.velocity.x = 3;
    const d = p.createSprite(90, 0);
    d.velocity.x = -3;
    expect(c.overlap(d)).toBe(true);

    const e = p.createSprite(0, 0);
    e.velocity.x = 3;
    const f = p.createSprite(300, 0);
    f.velocity.x = -3;
    expect(e.overlap(f)).toBe(false);

    const g = p.createSprite(300, 300);
    g.velocity.x = 3;
    const h = p.createSprite(0, 0);
    expect(g.overlap(h)).toBe(false);
    expect(pos(g)).toEqual([300, 300]);
  });

  it('COL-19, COL-20: collide after an update (rows 62, 63)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    prime(a, b);
    a.velocity.x = 3;
    update(a, b);
    expect(a.collide(b)).toBe(true);
    expect(pos(a)).toEqual([-10, 0]);
    expect(vel(a)).toEqual([0, 0]);
    expect(pos(b)).toEqual([90, 0]);
    expect(vel(b)).toEqual([0, 0]);

    const c = p.createSprite(0, 0);
    const d = p.createSprite(95, 0);
    prime(c, d);
    c.velocity.x = 3;
    c.velocity.y = 4;
    update(c, d);
    expect(c.collide(d)).toBe(true);
    expect(pos(c)).toEqual([-5, 4]);
    expect(vel(c)).toEqual([0, 4]);
  });

  async function scene64(vy = 0) {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(100, 0);
    prime(a, b);
    a.velocity.x = 2;
    a.velocity.y = vy;
    b.velocity.x = -1;
    update(a, b);
    return {p, a, b};
  }

  it('COL-20: bounce between movable sprites (row 64, example)', async () => {
    const {a, b} = await scene64();
    expect(pos(a)).toEqual([2, 0]);
    expect(pos(b)).toEqual([99, 0]);
    expect(a.bounce(b)).toBe(true);
    expect([pos(a), vel(a), pos(b), vel(b)]).toEqual([
      [-1, 0],
      [-1, 0],
      [99, 0],
      [2, 0],
    ]);
  });

  it('COL-20: mass and restitution (row 65)', async () => {
    const {a, b} = await scene64();
    a.mass = 2;
    a.restitution = 0.5;
    expect(a.bounce(b)).toBe(true);
    expect([pos(a), vel(a), pos(b), vel(b)]).toEqual([
      [-1, 0],
      [0.5, 0],
      [99, 0],
      [2, 0],
    ]);
  });

  it('COL-20: bounceOff and collide treat B as immovable (rows 66, 67)', async () => {
    const first = await scene64(1);
    expect(first.a.bounceOff(first.b)).toBe(true);
    expect([pos(first.a), vel(first.a), pos(first.b), vel(first.b)]).toEqual([
      [-1, 1],
      [-4, 1],
      [99, 0],
      [-1, 0],
    ]);
    expect(first.b.immovable).toBe(false);

    const second = await scene64(1);
    expect(second.a.collide(second.b)).toBe(true);
    expect([pos(second.a), vel(second.a), vel(second.b)]).toEqual([
      [-1, 1],
      [-1, 1],
      [-1, 0],
    ]);
    expect(second.b.restitution).toBe(1);
  });

  it('CMP-18, COL-20, Open question 7: collide with an immovable A (row 68)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(100, 0);
    a.immovable = true;
    prime(a, b);
    b.velocity.x = -4;
    update(a, b);
    expect(a.collide(b)).toBe(true);
    expect([pos(a), vel(a), pos(b), vel(b)]).toEqual([
      [0, 0],
      [0, 0],
      [96, 0],
      [0, 0],
    ]);
  });

  it('COL-19: displace after an update (row 69)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(100, 0);
    prime(a, b);
    a.velocity.x = 4;
    update(a, b);
    expect(a.displace(b)).toBe(true);
    expect([pos(a), vel(a), pos(b)]).toEqual([
      [4, 0],
      [4, 0],
      [104, 0],
    ]);
  });

  it('COL-20: bounce off an immovable B with restitution (rows 70, 71)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(90, 0);
    b.immovable = true;
    prime(a, b);
    a.velocity.x = 2;
    a.velocity.y = 3;
    expect(a.bounce(b)).toBe(true);
    expect([pos(a), vel(a)]).toEqual([
      [-10, 0],
      [-2, 3],
    ]);

    const c = p.createSprite(0, 0);
    const d = p.createSprite(90, 0);
    d.immovable = true;
    prime(c, d);
    c.restitution = 0.5;
    d.restitution = 0.8;
    c.velocity.x = 2;
    expect(c.bounce(d)).toBe(true);
    expect(pos(c)).toEqual([-10, 0]);
    expect(c.velocity.x).toBeCloseTo(-0.8, 12);
    expect(c.velocity.y).toBe(0);
  });
});

describe('collision.md: sub-frame sampling', () => {
  async function scene72(primed = true) {
    const p = await makeInstance();
    const a = p.createSprite(0, 0, 10, 10);
    const b = p.createSprite(50, 0, 10, 10);
    if (primed) {
      prime(a, b);
    }
    a.velocity.x = 100;
    update(a, b);
    expect(pos(a)).toEqual([100, 0]);
    return {p, a, b};
  }

  it('CMP-13, COL-16, Open question 2: overlap leaves A at the sample (row 72)', async () => {
    const {a, b} = await scene72();
    expect(a.overlap(b)).toBe(true);
    expect(pos(a)).toEqual([50, 0]);
    expect(pos(b)).toEqual([50, 0]);
  });

  it('COL-16: collide stops A before the sample (row 73)', async () => {
    const {a, b} = await scene72();
    expect(a.collide(b)).toBe(true);
    expect(pos(a)).toEqual([40, 0]);
    expect(vel(a)).toEqual([0, 0]);
  });

  it('CMP-13, COL-16: the check from B moves A too (row 74)', async () => {
    const {a, b} = await scene72();
    expect(b.overlap(a)).toBe(true);
    expect(pos(a)).toEqual([50, 0]);
  });

  it('CMP-13, COL-16, COL-21: an immovable A is restored (row 75)', async () => {
    const {a, b} = await scene72();
    a.immovable = true;
    expect(a.overlap(b)).toBe(true);
    expect(pos(a)).toEqual([100, 0]);
  });

  it('CMP-15, COL-16, Open question 4: a fresh swept box is a point at the origin (rows 76, 77)', async () => {
    const {a, b} = await scene72(false);
    expect(a.overlap(b)).toBe(false);
    expect(pos(a)).toEqual([100, 0]);

    const p = await makeInstance();
    const c = p.createSprite(-100, 0, 10, 10);
    const d = p.createSprite(50, 0, 10, 10);
    c.velocity.x = 100;
    update(c, d);
    expect(c.overlap(d)).toBe(false);
    update(c, d);
    expect(c.overlap(d)).toBe(true);
    expect(pos(c)).toEqual([50, 0]);
  });

  it('COL-16: the swept box covers only the update path (row 78)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0, 10, 10);
    const b = p.createSprite(50, 0, 10, 10);
    prime(a, b);
    a.velocity.x = 1;
    update(a, b);
    a.x = 100;
    expect(a.overlap(b)).toBe(false);
    expect(pos(a)).toEqual([100, 0]);
  });

  it('COL-16: samples that only touch fall back to the final check (rows 79, 80)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    const b = p.createSprite(200, 0);
    prime(a, b);
    a.velocity.x = 150;
    update(a, b);
    expect(a.collide(b)).toBe(true);
    expect([pos(a), vel(a)]).toEqual([
      [100, 0],
      [0, 0],
    ]);

    const c = p.createSprite(0, 0, 10, 10);
    const d = p.createSprite(15, 0, 10, 10);
    prime(c, d);
    c.velocity.x = 8;
    update(c, d);
    expect(c.collide(d)).toBe(true);
    expect([pos(c), vel(c)]).toEqual([
      [5, 0],
      [0, 0],
    ]);
  });

  it('CMP-14, COL-16, Open question 3: R uses unscaled sizes, so small sprites tunnel (row 81, example)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0);
    a.scale = 0.1;
    const b = p.createSprite(15, 0, 10, 10);
    prime(a, b);
    a.velocity.x = 30;
    update(a, b);
    expect(a.overlap(b)).toBe(false);
    expect(pos(a)).toEqual([30, 0]);
  });

  function fall(
    a: Sprite,
    wall: Sprite,
    count: number,
  ): {ys: number[]; hits: boolean[]} {
    const ys: number[] = [];
    const hits: boolean[] = [];
    for (let i = 0; i < count; i++) {
      update(a, wall);
      hits.push(a.collide(wall));
      ys.push(a.y);
    }
    return {ys, hits};
  }

  it('CMP-19, COL-16, Open question 8: a slow fall onto a wall (row 82)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(200, 0);
    a.velocity.y = 7;
    const wall = p.createSprite(200, 300, 400, 20);
    prime(a, wall);
    const {ys, hits} = fall(a, wall, 45);
    expect(ys.slice(0, 34)).toEqual(
      Array.from({length: 34}, (_, i) => 7 * (i + 1)),
    );
    expect(ys.slice(34)).toEqual(Array(11).fill(240));
    expect(hits).toEqual([
      ...Array(34).fill(false),
      true,
      ...Array(10).fill(false),
    ]);
    expect(a.velocity.y).toBe(0);
  });

  it('COL-16: a fast fall is caught by sampling (row 83)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(200, 0);
    a.velocity.y = 150;
    const wall = p.createSprite(200, 300, 400, 20);
    const {ys, hits} = fall(a, wall, 4);
    expect(ys).toEqual([150, 240, 240, 240]);
    expect(hits).toEqual([false, true, false, false]);
    expect(a.velocity.y).toBe(0);
  });

  it('COL-16: a sample at the wall centre separates along the wall height (row 84)', async () => {
    const p = await makeInstance();
    const a = p.createSprite(200, 0, 20, 20);
    a.velocity.y = 400;
    const wall = p.createSprite(200, 300, 400, 10);
    prime(a, wall);
    const {ys, hits} = fall(a, wall, 2);
    expect(ys).toEqual([285, 285]);
    expect(hits).toEqual([true, false]);
    expect(a.velocity.y).toBe(0);
  });

  it('COL-16: the swept box is refreshed only while moving', async () => {
    const p = await makeInstance();
    const a = p.createSprite(0, 0, 10, 10);
    prime(a);
    const collider = a.collider as Collider;
    expect(collider.swept).toEqual({x: 0, y: 0, wx: 0, wy: 0, hx: 0, hy: 0});
    update(a);
    expect(collider.swept.wx).toBe(0);
    a.velocity.y = 20;
    update(a);
    expect(collider.swept).toEqual({
      x: 0,
      y: 10,
      wx: 0,
      wy: 30,
      hx: -10,
      hy: 0,
    });
  });
});

describe('collision.md: pointer hit test', () => {
  it('COL-24: strictly inside the box (rows 85, 86, 87)', async () => {
    const p = await makeInstance();
    const s = p.createSprite(200, 200);
    const probe = (points: [number, number][]) =>
      points.map(([x, y]) => {
        setMouse(p, x, y);
        return p.mouseIsOver(s);
      });
    expect(
      probe([
        [200, 200],
        [249.99, 200],
        [250, 200],
        [250, 250],
        [249, 249],
        [150, 150],
        [150.01, 150.01],
      ]),
    ).toEqual([true, true, false, false, true, false, true]);

    s.rotation = 45;
    s.update();
    expect(
      probe([
        [260, 200],
        [270, 200],
        [240, 240],
        [234, 234],
        [235.5, 235.5],
      ]),
    ).toEqual([true, true, false, true, false]);

    s.rotation = 0;
    s.scale = 0.5;
    s.update();
    expect(
      probe([
        [224, 200],
        [225, 200],
      ]),
    ).toEqual([true, false]);
  });

  it('COL-24: falsy and removed sprites (rows 88, 89)', async () => {
    const p = await makeInstance();
    expect(p.mouseIsOver(undefined)).toBe(false);
    expect(p.mouseIsOver(null)).toBe(false);
    const s = p.createSprite(200, 200);
    s.remove();
    setMouse(p, 200, 200);
    expect(p.mouseIsOver(s)).toBe(true);
  });

  it('COL-24, COL-26: camera coordinates while the camera is active (row 91)', async () => {
    const p = await makeInstance();
    const s = p.createSprite(200, 200);
    setMouse(p, 0, 0);
    p.camera.active = true;
    p.camera.mouseX = 200;
    p.camera.mouseY = 200;
    expect(p.mouseIsOver(s)).toBe(true);
    p.camera.active = false;
    expect(p.mouseIsOver(s)).toBe(false);
  });

  it('COL-25: needs the raw button or a touch (row 92)', async () => {
    const p = await makeInstance();
    const s = p.createSprite(200, 200);
    setMouse(p, 200, 200);
    pressed(p, false);
    expect(p.mousePressedOver(s)).toBe(false);
    expect(s.collider).toBeUndefined();
    pressed(p, true);
    expect(p.mousePressedOver(s)).toBe(true);
    pressed(p, false, true);
    expect(p.mousePressedOver(s)).toBe(true);
    pressed(p, true);
    setMouse(p, 0, 0);
    expect(p.mousePressedOver(s)).toBe(false);
    expect(p.mousePressedOver(undefined)).toBe(false);
  });
});

describe('collision.md: edges', () => {
  it('COL-28: geometry; a second call returns the same group (row 96)', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    expect(
      edges.map(e => [e.x, e.y, e.width, e.height, p.allSprites.contains(e)]),
    ).toEqual([
      [-50, 200, 100, 400, true],
      [450, 200, 100, 400, true],
      [200, -50, 400, 100, true],
      [200, 450, 400, 100, true],
    ]);
    expect(p.createEdgeSprites()).toBe(edges);
  });

  it('CMP-19, COL-29: collide stops a sprite flush with the edge (rows 97, 98, example)', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    const s = p.createSprite(390, 200);
    expect(s.isTouching(edges)).toBe(true);
    expect(s.collide(edges)).toBe(true);
    expect(pos(s)).toEqual([350, 200]);
    expect(flags(s)).toEqual(['right']);
    expect(s.isTouching(edges)).toBe(false);
    const t = p.createSprite(350, 200);
    expect(t.isTouching(edges)).toBe(false);
  });

  it('COL-29: corners and far positions (rows 99, 101, 102)', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    for (const [start, end] of [
      [
        [390, 390],
        [350, 350],
      ],
      [
        [395, 385],
        [350, 350],
      ],
      [
        [600, 200],
        [600, 200],
      ],
      [
        [470, 200],
        [550, 200],
      ],
    ] as [number, number][][]) {
      const s = p.createSprite(start[0], start[1]);
      s.collide(edges);
      expect(pos(s)).toEqual(end);
      s.remove();
    }
  });

  it('COL-29: edges.displace pushes only the sprite (row 100)', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    const s = p.createSprite(10, -20);
    expect(edges.displace(s)).toBe(true);
    expect(pos(s)).toEqual([-50, -50]);
    expect(edges.map(pos)).toEqual([
      [-50, 200],
      [450, 200],
      [200, -50],
      [200, 450],
    ]);
  });

  it('COL-29: edges do not touch one another (row 103)', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    expect(edges.isTouching(edges)).toBe(false);
  });

  it('COL-29: a moving sprite stops at the edge (row 104)', async () => {
    const p = await makeInstance();
    const edges = p.createEdgeSprites();
    const s = p.createSprite(340, 200);
    prime(s, ...edges);
    s.velocity.x = 20;
    update(s, ...edges);
    expect(s.collide(edges)).toBe(true);
    expect([pos(s), vel(s)]).toEqual([
      [350, 200],
      [0, 0],
    ]);
  });

  it('COL-29: allSprites.isTouching(allSprites) counts edges (row 105)', async () => {
    const p = await makeInstance();
    p.createEdgeSprites();
    const s = p.createSprite(360, 200);
    expect(p.allSprites.isTouching(p.allSprites)).toBe(true);
    s.x = 200;
    expect(p.allSprites.isTouching(p.allSprites)).toBe(false);
  });
});

describe('sprite.md S33: the debug collider', () => {
  it('SPR-57 item 3, S33: drawing a debug sprite creates and outlines its collider', async () => {
    const p = await makeInstance();
    const s = p.createSprite(10, 20);
    s.depth = 3.5;
    s.rotation = 90;
    s.debug = true;
    const quads: number[][] = [];
    const quad = p.quad;
    (p as unknown as {quad: (...a: number[]) => void}).quad = (
      ...args: number[]
    ) => {
      quads.push(args);
    };
    const stop = recordP5(p);
    s.display();
    stop();
    (p as unknown as {quad: typeof quad}).quad = quad;
    expect(s.collider).toBeDefined();
    expect(quads.length).toBe(1);
    const xs = quads[0].filter((_, i) => i % 2 === 0).map(Math.round);
    const ys = quads[0].filter((_, i) => i % 2 === 1).map(Math.round);
    expect(xs.sort((m, n) => m - n)).toEqual([-40, -40, 60, 60]);
    expect(ys.sort((m, n) => m - n)).toEqual([-30, -30, 70, 70]);
  });
});
