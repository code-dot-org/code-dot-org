import {
  burstAlpha,
  createBurst,
  drawBursts,
  stepBurst,
} from '@cdo/apps/p5lab/spritelab/lab2/bursts';
import {PLATFORM_GRAVITY} from '@cdo/apps/p5lab/spritelab/lab2/platformPhysics';

const scene = (
  walls = [] as {x: number; y: number; halfW: number; halfH: number}[],
  gravity = PLATFORM_GRAVITY
) => ({
  width: 400,
  height: 400,
  walls,
  bodies: [],
  gravity,
});

// Deterministic randomness that walks the circle, so directions differ.
function turning() {
  let n = 0;
  return () => (n++ * 0.37) % 1;
}

describe('bursts', () => {
  it('flings the count out from the origin in different directions, with lift', () => {
    const burst = createBurst(
      'coin',
      12,
      {x: 100, y: 200},
      PLATFORM_GRAVITY,
      turning()
    );
    expect(burst.particles).toHaveLength(12);
    expect(burst.particles.every(p => p.x === 100 && p.y === 200)).toBe(true);
    const headings = new Set(
      burst.particles.map(p => Math.sign(p.vx) + ':' + Math.sign(p.vy))
    );
    expect(headings.size).toBeGreaterThan(1);
    const meanVy = burst.particles.reduce((s, p) => s + p.vy, 0) / 12;
    expect(meanVy).toBeLessThan(0);
  });

  it('falls with gravity, and under upward gravity rises', () => {
    const down = createBurst(
      'coin',
      1,
      {x: 100, y: 100},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    down.particles[0].vx = 0;
    down.particles[0].vy = 0;
    for (let i = 0; i < 20; i++) stepBurst(down, scene());
    expect(down.particles[0].vy).toBeGreaterThan(0);
    const up = createBurst(
      'coin',
      1,
      {x: 100, y: 300},
      -PLATFORM_GRAVITY,
      () => 0.5
    );
    up.particles[0].vx = 0;
    up.particles[0].vy = 0;
    for (let i = 0; i < 20; i++) stepBurst(up, scene([], -PLATFORM_GRAVITY));
    expect(up.particles[0].vy).toBeLessThan(0);
  });

  it('bounces off a tile top, losing energy, and settles after a few bounces', () => {
    const tile = {x: 100, y: 300, halfW: 40, halfH: 20};
    const burst = createBurst(
      'coin',
      1,
      {x: 100, y: 275},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    const p = burst.particles[0];
    Object.assign(p, {vx: 0, vy: 8, life: 1000});
    stepBurst(burst, scene([tile]));
    expect(p.y).toBe(280);
    expect(p.vy).toBeLessThan(0);
    expect(Math.abs(p.vy)).toBeLessThan(8);
    expect(p.bounces).toBe(1);
    for (let i = 0; i < 300; i++) stepBurst(burst, scene([tile]));
    expect(p.bounces).toBeGreaterThan(3);
    expect(p.vy).toBe(0);
    expect(p.y).toBe(280);
  });

  it('lands on the stage floor when the scene says it has one', () => {
    const burst = createBurst(
      'coin',
      1,
      {x: 100, y: 395},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    const p = burst.particles[0];
    Object.assign(p, {vx: 0, vy: 8, life: 1000});
    stepBurst(burst, {...scene(), floor: true});
    expect(p.y).toBe(400);
    expect(p.vy).toBeLessThan(0);
    const falling = createBurst(
      'coin',
      1,
      {x: 100, y: 395},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    Object.assign(falling.particles[0], {vx: 0, vy: 8, life: 1000});
    stepBurst(falling, scene());
    expect(falling.particles[0].y).toBeGreaterThan(400);
  });

  it('fades over its last third and is dropped at the end of its life', () => {
    const burst = createBurst(
      'coin',
      1,
      {x: 100, y: 100},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    const p = burst.particles[0];
    Object.assign(p, {vx: 0, vy: 0, life: 30});
    expect(burstAlpha(p)).toBe(1);
    p.age = 20;
    expect(burstAlpha(p)).toBe(1);
    p.age = 25;
    expect(burstAlpha(p)).toBeCloseTo(0.5, 5);
    p.age = 29;
    expect(stepBurst(burst, scene())).toBe(false);
    expect(burst.particles).toHaveLength(0);
  });

  it('draws each particle as the image when loaded, a dot otherwise', () => {
    const calls: string[] = [];
    const canvas = new Proxy(
      {CENTER: 'center'},
      {
        get: (t, name: string) =>
          name in t
            ? (t as Record<string, unknown>)[name]
            : () => calls.push(name),
      }
    ) as Parameters<typeof drawBursts>[0];
    const bursts = [
      createBurst('coin', 3, {x: 0, y: 0}, PLATFORM_GRAVITY, () => 0.5),
    ];
    drawBursts(canvas, bursts, () => ({image: {}}));
    expect(calls.filter(c => c === 'image')).toHaveLength(3);
    calls.length = 0;
    drawBursts(canvas, bursts, () => ({
      image: {},
      frame: {x: 0, y: 0, width: 32, height: 32},
    }));
    expect(calls.filter(c => c === 'image')).toHaveLength(3);
    calls.length = 0;
    drawBursts(canvas, bursts, () => undefined);
    expect(calls.filter(c => c === 'ellipse')).toHaveLength(3);
    expect(calls.filter(c => c === 'image')).toHaveLength(0);
  });
});
