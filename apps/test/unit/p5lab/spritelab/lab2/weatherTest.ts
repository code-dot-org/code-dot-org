import {PLATFORM_GRAVITY} from '@cdo/apps/p5lab/spritelab/lab2/platformPhysics';
import {
  bodyBox,
  createWeather,
  drawWeather,
  stepWeather,
  weatherCount,
  weatherGravity,
  WeatherScene,
} from '@cdo/apps/p5lab/spritelab/lab2/weather';

// A deterministic "random": the same value every call.
const fixed = (value: number) => () => value;

const scene = (
  walls: WeatherScene['walls'] = [],
  bodies: WeatherScene['bodies'] = [],
  gravity = PLATFORM_GRAVITY
): WeatherScene => ({width: 400, height: 400, walls, bodies, gravity});

const steps = (
  w: ReturnType<typeof createWeather>,
  s: WeatherScene,
  n: number
) => {
  for (let i = 0; i < n; i++) {
    stepWeather(w, s, fixed(0.5));
  }
};

const tile = {x: 200, y: 300, halfW: 20, halfH: 20};
const body = {x: 200, y: 300, halfW: 15, halfH: 20};

describe('weather', () => {
  it('fills a pool of its kind spread along the fall, and none for none', () => {
    const rain = createWeather('rain', scene(), fixed(0.5));
    expect(rain.particles).toHaveLength(weatherCount('rain'));
    expect(rain.particles.every(p => p.vy > 0)).toBe(true);
    // Spread from a world above the top to the bottom: the first frame is
    // already raining, not a front arriving.
    const spread = createWeather('rain', scene(), Math.random).particles.map(
      p => p.y
    );
    expect(Math.min(...spread)).toBeLessThan(-100);
    expect(Math.max(...spread)).toBeGreaterThan(100);
    expect(createWeather('none', scene()).particles).toHaveLength(0);
  });

  it('a drop that leaves the world comes back from the top, keeping the pool full', () => {
    const rain = createWeather('rain', scene(), fixed(0.5));
    const drop = rain.particles[0];
    drop.y = 401;
    stepWeather(rain, scene(), fixed(0.5));
    expect(rain.particles).toHaveLength(weatherCount('rain'));
    expect(rain.particles[0]).not.toBe(drop);
    expect(rain.particles[0].y).toBeLessThan(0);
  });

  it('a drop landing on a tile bounces a little, fades for a few frames, then comes around', () => {
    const rain = createWeather('rain', scene([tile]), fixed(0.5));
    const drop = rain.particles[0];
    Object.assign(drop, {x: 200, y: 275, vx: 0, vy: 8, speed: 8});
    stepWeather(rain, scene([tile]), fixed(0.5));
    expect(drop.state).toBe('settling');
    expect(drop.y).toBe(280);
    expect(drop.vy).toBeLessThan(0);
    steps(rain, scene([tile]), 3);
    expect(drop.alpha).toBeLessThan(0.7);
    steps(rain, scene([tile]), 5);
    expect(rain.particles[0]).not.toBe(drop);
  });

  it('a drop landing on a body does the same as on a tile, kicked away from it', () => {
    const rain = createWeather('rain', scene([], [body]), fixed(0.5));
    const drop = rain.particles[0];
    Object.assign(drop, {x: 190, y: 275, vx: 0, vy: 8, speed: 8});
    stepWeather(rain, scene([], [body]), fixed(0.5));
    expect(drop.state).toBe('settling');
    expect(drop.settleFrames).toBe(8);
    expect(drop.vy).toBeLessThan(0);
    expect(drop.vx).toBeLessThan(0);
  });

  it('a flake rests on a tile and fades for half a second', () => {
    const snow = createWeather('snow', scene([tile]), fixed(0.5));
    const flake = snow.particles[0];
    Object.assign(flake, {x: 200, y: 279, vx: 0, vy: 1.5, speed: 1.5, age: 0});
    stepWeather(snow, scene([tile]), fixed(0.5));
    expect(flake.state).toBe('settling');
    expect(flake.settleFrames).toBe(30);
    steps(snow, scene([tile]), 15);
    expect(snow.particles[0]).toBe(flake);
    expect(flake.y).toBe(280);
    expect(flake.alpha).toBeLessThan(0.6);
    steps(snow, scene([tile]), 16);
    expect(snow.particles[0]).not.toBe(flake);
  });

  it('a flake touched by a body melts along its own path, unmoved by it', () => {
    const snow = createWeather('snow', scene([], [body]), fixed(0.5));
    const flake = snow.particles[0];
    // Walked into from the side, below the body's top.
    Object.assign(flake, {x: 190, y: 300, vx: 0, vy: 1.5, speed: 1.5, age: 0});
    stepWeather(snow, scene([], [body]), fixed(0.5));
    expect(flake.state).toBe('settling');
    expect(flake.settleFrames).toBe(10);
    const y = flake.y;
    steps(snow, scene([], [body]), 4);
    expect(flake.y).toBeGreaterThan(y);
    // Its own sway only: never shoved to the body's edge.
    expect(Math.abs(flake.x - 190)).toBeLessThan(1);
    expect(flake.alpha).toBeLessThanOrEqual(0.6);
  });

  it('a flake drifting into a tile through its side slides down outside it', () => {
    const snow = createWeather('snow', scene([tile]), fixed(0.5));
    const flake = snow.particles[0];
    Object.assign(flake, {
      x: 179.5,
      y: 300,
      vx: 0,
      vy: 1,
      speed: 1,
      age: 0,
      phase: 0,
    });
    snow.wind = 2;
    stepWeather(snow, scene([tile]), fixed(0.5));
    expect(flake.state).toBe('falling');
    expect(flake.x).toBeLessThan(180);
    expect(flake.y).toBeGreaterThan(300);
  });

  it('falls as under the default gravity when the scene has none', () => {
    const rain = createWeather('rain', scene([], [], 0), fixed(0.5));
    expect(rain.gravity).toBe(PLATFORM_GRAVITY);
    const drop = rain.particles[0];
    Object.assign(drop, {y: 100, vy: 8, speed: 8});
    steps(rain, scene([], [], 0), 10);
    expect(drop.vy).toBeCloseTo(8, 5);
    expect(drop.y).toBeCloseTo(180, 5);
  });

  it('flipping gravity slows the drops, turns them, and sends them up to speed upward', () => {
    const rain = createWeather('rain', scene(), fixed(0.5));
    const drop = rain.particles[0];
    Object.assign(drop, {y: 200, vy: 8, speed: 8});
    const up = scene([], [], -PLATFORM_GRAVITY);
    const trace: number[] = [];
    for (let i = 0; i < 90; i++) {
      stepWeather(rain, up, fixed(0.5));
      trace.push(rain.particles[0] === drop ? drop.vy : NaN);
    }
    const seen = trace.filter(Number.isFinite);
    // Still falling at first, slower; then rising gently; then at full
    // speed upward before it leaves the top.
    expect(seen[2]).toBeGreaterThan(0);
    expect(seen[2]).toBeLessThan(8);
    expect(seen.some(v => v < 0 && v > -4)).toBe(true);
    expect(Math.min(...seen)).toBeLessThan(-7);
  });

  it('under upward gravity drops land on undersides and come back from below', () => {
    const up = scene([tile], [], -PLATFORM_GRAVITY);
    const rain = createWeather('rain', up, fixed(0.5));
    expect(rain.particles.every(p => p.vy < 0)).toBe(true);
    const drop = rain.particles[0];
    Object.assign(drop, {x: 200, y: 325, vx: 0, vy: -8, speed: 8});
    stepWeather(rain, up, fixed(0.5));
    expect(drop.state).toBe('settling');
    expect(drop.y).toBe(320);
    const other = rain.particles[1];
    other.y = -9;
    stepWeather(rain, up, fixed(0.5));
    expect(rain.particles[1].y).toBeGreaterThan(400);
  });

  it('reads zero gravity as the default and any other gravity as itself', () => {
    expect(weatherGravity(0)).toBe(PLATFORM_GRAVITY);
    expect(weatherGravity(0.3)).toBe(0.3);
    expect(weatherGravity(-0.75)).toBe(-0.75);
  });

  it('measures a character as its feet-anchored body', () => {
    expect(
      bodyBox({position: {x: 100, y: 100}, width: 50, height: 100, scale: 1})
    ).toEqual({x: 100, y: 110, halfW: 20, halfH: 40});
  });

  it('draws nothing for none and one shape per particle otherwise', () => {
    const calls: string[] = [];
    const canvas = new Proxy(
      {},
      {get: (_, name: string) => () => calls.push(name)}
    ) as Parameters<typeof drawWeather>[0];
    drawWeather(canvas, createWeather('none', scene()));
    expect(calls).toEqual([]);
    drawWeather(canvas, createWeather('snow', scene(), fixed(0.5)));
    expect(calls.filter(c => c === 'ellipse')).toHaveLength(
      weatherCount('snow')
    );
  });
});
