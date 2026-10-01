import {
  BURST_LOOKS,
  burstAlpha,
  createBurst,
  drawBursts,
  isBurstLook,
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

  it('knows its looks', () => {
    expect(BURST_LOOKS).toEqual(['sparks', 'confetti']);
    expect(isBurstLook('confetti')).toBe(true);
    expect(isBurstLook('rain')).toBe(false);
  });

  it('draws sparks as the tinted image, a dot until it loads, and confetti as paper', () => {
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
      createBurst('sparks', 3, {x: 0, y: 0}, PLATFORM_GRAVITY, () => 0.5),
    ];
    drawBursts(canvas, bursts, {});
    expect(calls.filter(c => c === 'image')).toHaveLength(3);
    expect(calls.filter(c => c === 'tint')).toHaveLength(3);
    calls.length = 0;
    drawBursts(canvas, bursts, undefined);
    expect(calls.filter(c => c === 'ellipse')).toHaveLength(3);
    expect(calls.filter(c => c === 'image')).toHaveLength(0);
    calls.length = 0;
    drawBursts(
      canvas,
      [createBurst('confetti', 4, {x: 0, y: 0}, PLATFORM_GRAVITY, () => 0.5)],
      {}
    );
    expect(calls.filter(c => c === 'rect')).toHaveLength(4);
    expect(calls.filter(c => c === 'image')).toHaveLength(0);
  });
});
