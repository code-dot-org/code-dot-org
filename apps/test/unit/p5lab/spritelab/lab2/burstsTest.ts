import {
  BURST_LOOKS,
  burstAlpha,
  burstOrigin,
  createBurst,
  drawBursts,
  isBurstLook,
  shareOut,
  stepBurst,
} from '@cdo/apps/p5lab/spritelab/lab2/bursts';
import {PLATFORM_GRAVITY} from '@cdo/apps/p5lab/spritelab/lab2/platformPhysics';

const scene = (gravity = PLATFORM_GRAVITY) => ({
  width: 400,
  height: 400,
  gravity,
});

// Deterministic randomness that walks the circle, so directions differ.
function turning() {
  let n = 0;
  return () => (n++ * 0.37) % 1;
}

describe('bursts', () => {
  it('flings the count out from the origin in different directions and colours, with lift', () => {
    const burst = createBurst(
      'confetti',
      12,
      {x: 100, y: 200},
      PLATFORM_GRAVITY,
      turning()
    );
    expect(burst.particles).toHaveLength(12);
    expect(burst.particles.every(p => p.x === 100 && p.y === 200)).toBe(true);
    const headings = new Set(
      burst.particles.map(p => `${Math.sign(p.vx)}:${Math.sign(p.vy)}`)
    );
    expect(headings.size).toBeGreaterThan(1);
    expect(
      new Set(burst.particles.map(p => p.color.join())).size
    ).toBeGreaterThan(1);
    const meanVy = burst.particles.reduce((s, p) => s + p.vy, 0) / 12;
    expect(meanVy).toBeLessThan(0);
  });

  it('slows in the air and is drawn down by gravity, up under upward gravity', () => {
    const down = createBurst(
      'sparks',
      1,
      {x: 100, y: 100},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    Object.assign(down.particles[0], {vx: 6, vy: 0, life: 1000});
    stepBurst(down, scene());
    expect(down.particles[0].vx).toBeLessThan(6);
    for (let i = 0; i < 20; i++) stepBurst(down, scene());
    expect(down.particles[0].vy).toBeGreaterThan(0);
    const up = createBurst(
      'sparks',
      1,
      {x: 100, y: 300},
      -PLATFORM_GRAVITY,
      () => 0.5
    );
    Object.assign(up.particles[0], {vx: 0, vy: 0, life: 1000});
    for (let i = 0; i < 20; i++) stepBurst(up, scene(-PLATFORM_GRAVITY));
    expect(up.particles[0].vy).toBeLessThan(0);
  });

  it('passes through everything and is gone in under a second', () => {
    const burst = createBurst(
      'sparks',
      20,
      {x: 200, y: 200},
      PLATFORM_GRAVITY,
      turning()
    );
    let frames = 0;
    while (stepBurst(burst, scene()) && frames < 120) {
      frames++;
    }
    expect(burst.particles).toHaveLength(0);
    expect(frames).toBeLessThan(60);
  });

  it('fades out over the last part of its life and is dropped when it is up', () => {
    const burst = createBurst(
      'sparks',
      1,
      {x: 100, y: 100},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    const p = burst.particles[0];
    Object.assign(p, {vx: 0, vy: 0, life: 30});
    expect(burstAlpha(p)).toBe(1);
    p.age = 14;
    expect(burstAlpha(p)).toBe(1);
    p.age = 21;
    expect(burstAlpha(p)).toBeCloseTo(0.6, 5);
    p.age = 29;
    expect(stepBurst(burst, scene())).toBe(false);
    expect(burst.particles).toHaveLength(0);
  });

  it('confetti floats: it lives longer, falls slower and launches gentler than sparks', () => {
    const at = (look: 'sparks' | 'confetti') =>
      createBurst(look, 1, {x: 200, y: 200}, PLATFORM_GRAVITY, () => 0.5);
    const sparks = at('sparks');
    const confetti = at('confetti');
    expect(confetti.particles[0].life).toBeGreaterThan(
      sparks.particles[0].life
    );
    const speed = (b: ReturnType<typeof at>) =>
      Math.hypot(b.particles[0].vx, b.particles[0].vy);
    expect(speed(confetti)).toBeLessThan(speed(sparks));
    for (const b of [sparks, confetti]) {
      Object.assign(b.particles[0], {vx: 0, vy: 0, life: 1000});
      for (let i = 0; i < 30; i++) stepBurst(b, scene());
    }
    expect(confetti.particles[0].vy).toBeLessThan(sparks.particles[0].vy);
  });

  it('starts dust at the feet, the edge gravity presses the sprite against', () => {
    const sprite = {
      position: {x: 50, y: 100},
      width: 40,
      height: 60,
      scale: 0.5,
    };
    expect(burstOrigin('sparks', sprite, PLATFORM_GRAVITY)).toEqual({
      x: 50,
      y: 100,
    });
    expect(burstOrigin('dust', sprite, PLATFORM_GRAVITY)).toEqual({
      x: 50,
      y: 115,
    });
    expect(burstOrigin('dust', sprite, -PLATFORM_GRAVITY)).toEqual({
      x: 50,
      y: 85,
    });
  });

  it('dust flies out to either side near level, slowly, and settles back gently', () => {
    const burst = createBurst(
      'dust',
      20,
      {x: 100, y: 200},
      PLATFORM_GRAVITY,
      turning()
    );
    const sides = new Set(burst.particles.map(p => Math.sign(p.vx)));
    expect(sides).toEqual(new Set([1, -1]));
    // Scattered along the feet, not from one point; never off them.
    expect(new Set(burst.particles.map(p => p.x)).size).toBeGreaterThan(1);
    burst.particles.forEach(p => {
      expect(Math.abs(p.x - 100)).toBeLessThanOrEqual(10);
      expect(p.y).toBe(200);
    });
    burst.particles.forEach(p => {
      // Within the fan of level, before the small lift.
      expect(Math.abs(p.vy + 0.8)).toBeLessThan(Math.abs(p.vx) * 0.7);
      expect(Math.hypot(p.vx, p.vy + 0.8)).toBeLessThanOrEqual(3);
    });
    const p = burst.particles[0];
    Object.assign(p, {vx: 0, vy: 0, life: 1000});
    for (let i = 0; i < 60; i++) stepBurst(burst, scene());
    expect(p.vy).toBeGreaterThan(0);
    expect(p.vy).toBeLessThan(1);
  });

  it('shares a count out exactly, the first parts taking the extra', () => {
    expect(shareOut(7, 3)).toEqual([3, 2, 2]);
    expect(shareOut(2, 3)).toEqual([1, 1, 0]);
    expect(shareOut(0, 2)).toEqual([0, 0]);
  });

  it('knows its looks', () => {
    expect(BURST_LOOKS).toEqual(['sparks', 'confetti', 'dust']);
    expect(isBurstLook('confetti')).toBe(true);
    expect(isBurstLook('rain')).toBe(false);
  });

  it('draws sparks as the tinted image, a dot until it loads, confetti as paper, and dust as specks that grow', () => {
    const calls: string[] = [];
    const context = {globalAlpha: 1};
    const alphas: number[] = [];
    const sizes: number[] = [];
    const canvas = new Proxy(
      {CENTER: 'center', drawingContext: context},
      {
        get: (t, name: string) => {
          if (name in t) {
            return (t as Record<string, unknown>)[name];
          }
          return (...args: unknown[]) => {
            if (name === 'image' || name === 'ellipse' || name === 'rect') {
              alphas.push(context.globalAlpha);
            }
            if (name === 'image' || name === 'ellipse') {
              sizes.push(args[3] as number);
            }
            calls.push(name);
          };
        },
      }
    ) as Parameters<typeof drawBursts>[0];
    const bursts = [
      createBurst('sparks', 3, {x: 0, y: 0}, PLATFORM_GRAVITY, () => 0.5),
    ];
    bursts[0].particles[1].age = bursts[0].particles[1].life - 1;
    drawBursts(canvas, bursts, () => ({}));
    expect(calls.filter(c => c === 'image')).toHaveLength(3);
    // The fade goes through the canvas alpha, restored afterwards.
    expect(alphas[0]).toBe(1);
    expect(alphas[1]).toBeLessThan(0.2);
    expect(context.globalAlpha).toBe(1);
    calls.length = 0;
    drawBursts(canvas, bursts, () => undefined);
    expect(calls.filter(c => c === 'ellipse')).toHaveLength(3);
    expect(calls.filter(c => c === 'image')).toHaveLength(0);
    calls.length = 0;
    drawBursts(
      canvas,
      [createBurst('confetti', 4, {x: 0, y: 0}, PLATFORM_GRAVITY, () => 0.5)],
      () => ({})
    );
    expect(calls.filter(c => c === 'rect')).toHaveLength(4);
    expect(calls.filter(c => c === 'image')).toHaveLength(0);
    calls.length = 0;
    sizes.length = 0;
    const shapes: string[] = [];
    const dust = createBurst(
      'dust',
      2,
      {x: 0, y: 0},
      PLATFORM_GRAVITY,
      () => 0.5
    );
    dust.particles[1].age = dust.particles[1].life - 1;
    drawBursts(canvas, [dust], shape => {
      shapes.push(shape);
      return {};
    });
    // No image: a speck is a plain shape, the old one a little bigger.
    expect(shapes).toEqual([]);
    expect(calls.filter(c => c === 'ellipse')).toHaveLength(2);
    expect(sizes[1]).toBeGreaterThan(sizes[0]);
    expect(sizes[1]).toBeLessThan(sizes[0] * 1.5);
  });
});
