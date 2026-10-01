import {
  createWeather,
  drawWeather,
  playerBox,
  stepWeather,
  weatherCount,
  WeatherScene,
} from '@cdo/apps/p5lab/spritelab/lab2/weather';

// A deterministic "random": the same value every call.
const fixed = (value: number) => () => value;

const scene = (
  walls: WeatherScene['walls'] = [],
  bodies: WeatherScene['bodies'] = []
): WeatherScene => ({
  width: 400,
  height: 400,
  walls,
  bodies,
});

const settle = (
  w: ReturnType<typeof createWeather>,
  s: WeatherScene,
  n: number
) => {
  for (let i = 0; i < n; i++) {
    stepWeather(w, s, fixed(0.5));
  }
};

describe('weather', () => {
  it('fills a pool of its kind above the world, and none for none', () => {
    const rain = createWeather('rain', scene(), fixed(0.5));
    expect(rain.particles).toHaveLength(weatherCount('rain'));
    expect(rain.particles.every(p => p.y < 0 && p.state === 'falling')).toBe(
      true
    );
    expect(createWeather('none', scene()).particles).toHaveLength(0);
  });

  it('keeps the pool full: a drop that leaves the world comes back from the top', () => {
    const rain = createWeather('rain', scene(), fixed(0.5));
    const drop = rain.particles[0];
    drop.y = 401;
    stepWeather(rain, scene(), fixed(0.5));
    expect(rain.particles).toHaveLength(weatherCount('rain'));
    expect(rain.particles[0]).not.toBe(drop);
    expect(rain.particles[0].y).toBeLessThan(0);
  });

  it('a drop landing on a tile splashes there for a few frames, then comes around', () => {
    const tile = {x: 200, y: 300, halfW: 20, halfH: 20};
    const rain = createWeather('rain', scene([tile]), fixed(0.5));
    const drop = rain.particles[0];
    Object.assign(drop, {x: 200, y: 275, vx: 0, vy: 8});
    stepWeather(rain, scene([tile]), fixed(0.5));
    expect(drop.state).toBe('splashing');
    expect(drop.y).toBe(280);
    settle(rain, scene([tile]), 3);
    expect(rain.particles[0]).not.toBe(drop);
  });

  it('a flake rests on a tile and fades before it comes around', () => {
    const tile = {x: 200, y: 300, halfW: 20, halfH: 20};
    const snow = createWeather('snow', scene([tile]), fixed(0.5));
    const flake = snow.particles[0];
    Object.assign(flake, {x: 200, y: 279, vx: 0, vy: 1.5, age: 0});
    stepWeather(snow, scene([tile]), fixed(0.5));
    expect(flake.state).toBe('resting');
    settle(snow, scene([tile]), 30);
    expect(snow.particles[0]).toBe(flake);
    expect(flake.alpha).toBeLessThan(0.6);
    settle(snow, scene([tile]), 31);
    expect(snow.particles[0]).not.toBe(flake);
  });

  it('a drop bounces off a player and keeps falling', () => {
    const player = {x: 200, y: 300, halfW: 15, halfH: 20};
    const rain = createWeather('rain', scene([], [player]), fixed(0.5));
    const drop = rain.particles[0];
    Object.assign(drop, {x: 190, y: 275, vx: 0, vy: 8});
    stepWeather(rain, scene([], [player]), fixed(0.5));
    expect(drop.state).toBe('falling');
    expect(drop.vy).toBeLessThan(0);
    expect(drop.vx).toBeLessThan(0);
    settle(rain, scene([], [player]), 10);
    expect(drop.vy).toBeGreaterThan(0);
  });

  it('a flake drifting into a tile through its side slides down outside it', () => {
    const tile = {x: 200, y: 300, halfW: 20, halfH: 20};
    const snow = createWeather('snow', scene([tile]), fixed(0.5));
    const flake = snow.particles[0];
    // Already below the tile's top, just outside its left face, drifting in.
    Object.assign(flake, {x: 179.5, y: 300, vx: 0, vy: 1, age: 0, phase: 0});
    snow.wind = 2;
    stepWeather(snow, scene([tile]), fixed(0.5));
    expect(flake.state).toBe('falling');
    expect(flake.x).toBeLessThan(180);
    expect(flake.y).toBeGreaterThan(300);
  });

  it('measures a player as its feet-anchored body', () => {
    const box = playerBox({
      position: {x: 100, y: 100},
      width: 50,
      height: 100,
      scale: 1,
    });
    expect(box).toEqual({x: 100, y: 110, halfW: 20, halfH: 40});
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
