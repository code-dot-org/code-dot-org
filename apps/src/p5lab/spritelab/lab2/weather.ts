// World-wide weather for a scene: a fixed pool of particles that fall
// through the world, react to what they land on by their kind's rule, and
// come back around from the top. Particles are plain records stepped once
// a frame, not sprites: no blocks can name them and no event sees them.

import {PLAYER_BODY_SCALE} from './platformPhysics';

export const WEATHER_KINDS = ['none', 'rain', 'snow'] as const;
export type WeatherKind = (typeof WEATHER_KINDS)[number];

export function isWeatherKind(value: unknown): value is WeatherKind {
  return WEATHER_KINDS.includes(value as WeatherKind);
}

/** An axis-aligned box in world coordinates, by center and half sizes. */
export interface Box {
  x: number;
  y: number;
  halfW: number;
  halfH: number;
}

/** What the particles fall through this frame. */
export interface WeatherScene {
  width: number;
  height: number;
  /** Tiles: a particle landing on one does what its kind does on ground. */
  walls: Box[];
  /** Players: a particle landing on one bounces off. */
  bodies: Box[];
}

export type ParticleState = 'falling' | 'splashing' | 'resting';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Frames in the current state. */
  age: number;
  state: ParticleState;
  /** 0..1, for the fade of a resting flake. */
  alpha: number;
  /** Per-particle phase, so drifting flakes do not sway in step. */
  phase: number;
}

export interface Weather {
  kind: WeatherKind;
  particles: Particle[];
  /** Horizontal push shared by every particle this run. */
  wind: number;
}

export type Random = () => number;

interface Rule {
  count: number;
  wind: (random: Random) => number;
  /** A fresh particle above the top edge, spread across the world. */
  spawn: (scene: WeatherScene, wind: number, random: Random) => Particle;
  /** One frame of free fall. */
  fall: (p: Particle, wind: number) => void;
  /** Frames a particle spends on the ground before it comes around. */
  groundFrames: number;
  groundState: ParticleState;
  /** How hard a particle bounces off a player: fraction of its fall speed. */
  bounce: number;
}

const between = (random: Random, min: number, max: number) =>
  min + random() * (max - min);

function spawnAbove(
  scene: WeatherScene,
  random: Random,
  vy: number,
  vx: number
): Particle {
  return {
    x: between(random, 0, scene.width),
    // Staggered above the top, so a fresh pool does not arrive as one sheet.
    y: -between(random, 4, scene.height / 2),
    vx,
    vy,
    age: 0,
    state: 'falling',
    alpha: 1,
    phase: random() * Math.PI * 2,
  };
}

const RULES: Record<Exclude<WeatherKind, 'none'>, Rule> = {
  rain: {
    count: 60,
    wind: random => between(random, -0.6, 0.6),
    spawn: (scene, wind, random) =>
      spawnAbove(scene, random, between(random, 7, 10), wind),
    fall: p => {
      p.x += p.vx;
      p.y += p.vy;
    },
    groundFrames: 3,
    groundState: 'splashing',
    bounce: 0.35,
  },
  snow: {
    count: 30,
    wind: random => between(random, -0.3, 0.3),
    spawn: (scene, wind, random) =>
      spawnAbove(scene, random, between(random, 0.8, 1.6), wind),
    fall: (p, wind) => {
      p.x += wind + Math.sin(p.age * 0.05 + p.phase) * 0.5;
      p.y += p.vy;
    },
    groundFrames: 60,
    groundState: 'resting',
    bounce: 0.5,
  },
};

export function weatherCount(kind: WeatherKind): number {
  return kind === 'none' ? 0 : RULES[kind].count;
}

/** A full pool for the kind, already falling. */
export function createWeather(
  kind: WeatherKind,
  scene: WeatherScene,
  random: Random = Math.random
): Weather {
  if (kind === 'none') {
    return {kind, particles: [], wind: 0};
  }
  const rule = RULES[kind];
  const wind = rule.wind(random);
  const particles = Array.from({length: rule.count}, () =>
    rule.spawn(scene, wind, random)
  );
  return {kind, particles, wind};
}

/** The box a player presents to the weather: its feet-anchored body. */
export function playerBox(sprite: {
  position: {x: number; y: number};
  width: number;
  height: number;
  scale: number;
}): Box {
  const imgHalfH = (sprite.height * sprite.scale) / 2;
  const halfH = imgHalfH * PLAYER_BODY_SCALE;
  return {
    x: sprite.position.x,
    y: sprite.position.y + (imgHalfH - halfH),
    halfW: ((sprite.width * sprite.scale) / 2) * PLAYER_BODY_SCALE,
    halfH,
  };
}

// The top surface a falling particle crossed this frame, if any.
function landedOn(boxes: Box[], x: number, fromY: number, toY: number) {
  let hit: Box | undefined;
  for (const box of boxes) {
    const top = box.y - box.halfH;
    if (
      x >= box.x - box.halfW &&
      x <= box.x + box.halfW &&
      fromY <= top &&
      toY >= top &&
      (!hit || top < hit.y - hit.halfH)
    ) {
      hit = box;
    }
  }
  return hit;
}

/**
 * One frame. Falling particles move, land on tiles (and do what their kind
 * does there), bounce off players, and come back around from the top once
 * they leave the world or finish on the ground.
 */
export function stepWeather(
  weather: Weather,
  scene: WeatherScene,
  random: Random = Math.random
): void {
  if (weather.kind === 'none') {
    return;
  }
  const rule = RULES[weather.kind];
  weather.particles.forEach((p, i) => {
    p.age++;
    if (p.state !== 'falling') {
      p.alpha = 1 - p.age / rule.groundFrames;
      if (p.age >= rule.groundFrames) {
        weather.particles[i] = rule.spawn(scene, weather.wind, random);
      }
      return;
    }
    const fromY = p.y;
    rule.fall(p, weather.wind);
    const body = landedOn(scene.bodies, p.x, fromY, p.y);
    if (body) {
      p.y = body.y - body.halfH;
      p.vy = -Math.abs(p.vy) * rule.bounce;
      p.vx += p.x < body.x ? -1 : 1;
      return;
    }
    // A bounce is over once the particle falls again.
    if (p.vy < 0) {
      p.vy += 0.5;
      return;
    }
    const wall = landedOn(scene.walls, p.x, fromY, p.y);
    if (wall) {
      p.y = wall.y - wall.halfH;
      p.state = rule.groundState;
      p.age = 0;
      return;
    }
    if (p.y > scene.height + 8 || p.x < -8 || p.x > scene.width + 8) {
      weather.particles[i] = rule.spawn(scene, weather.wind, random);
    }
  });
}

/** The p5 calls the drawing needs. */
export interface WeatherCanvas {
  push(): void;
  pop(): void;
  noStroke(): void;
  noFill(): void;
  stroke(r: number, g: number, b: number, a?: number): void;
  strokeWeight(w: number): void;
  fill(r: number, g: number, b: number, a?: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  ellipse(x: number, y: number, w: number, h?: number): void;
}

/** Draw the pool in world coordinates: a streak per raindrop, a dot per
    flake, a short splash on the ground. Shapes stand in for art for now. */
export function drawWeather(p5: WeatherCanvas, weather: Weather): void {
  if (weather.kind === 'none') {
    return;
  }
  p5.push();
  for (const p of weather.particles) {
    const a = Math.max(0, Math.min(1, p.alpha)) * 255;
    if (weather.kind === 'rain') {
      if (p.state === 'splashing') {
        p5.noFill();
        p5.stroke(170, 200, 240, a);
        p5.strokeWeight(1);
        p5.ellipse(p.x, p.y, 4 + p.age * 3, 2 + p.age);
      } else {
        p5.stroke(120, 160, 230, 200);
        p5.strokeWeight(2);
        p5.line(p.x, p.y, p.x - p.vx * 1.5, p.y - p.vy * 1.5);
      }
    } else {
      // Tinted and edged, so a flake also shows against a white stage.
      p5.stroke(170, 190, 220, a);
      p5.strokeWeight(1);
      p5.fill(240, 246, 255, a);
      p5.ellipse(p.x, p.y, 6, 6);
    }
  }
  p5.pop();
}
