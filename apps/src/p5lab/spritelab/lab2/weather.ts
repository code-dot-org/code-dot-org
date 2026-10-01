// World-wide weather for a scene: a fixed pool of particles that fall with
// the scene's gravity, react to what they land on by their kind's rule, and
// come back around from the edge the flow comes from. Particles are plain
// records stepped once a frame, not sprites: no block can name them and no
// event sees them.

import {PLATFORM_GRAVITY, PLAYER_BODY_SCALE} from './platformPhysics';

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
  /** Characters and objects: a particle landing on one does what its kind
      does on a body. */
  bodies: Box[];
  /** The scene's gravity right now; the weather eases toward it. */
  gravity: number;
}

export type ParticleState = 'falling' | 'settling';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Fall speed under the default gravity; gravity scales it. */
  speed: number;
  /** Frames in the current state. */
  age: number;
  state: ParticleState;
  /** Frames a settling particle lasts before it comes around. */
  settleFrames: number;
  /** A settling particle that sits where it landed, rather than moving on. */
  holds: boolean;
  /** 0..1, the fade of a settling particle. */
  alpha: number;
  /** Per-particle phase, so drifting flakes do not sway in step. */
  phase: number;
}

export interface Weather {
  kind: WeatherKind;
  particles: Particle[];
  /** Horizontal push shared by every particle this run. */
  wind: number;
  /** The gravity the particles feel: eased toward the scene's, so a flip
      slows them, turns them, and brings them up to speed the other way. */
  gravity: number;
}

export type Random = () => number;

/** What a particle does when it meets something. */
interface Contact {
  /** Frames it lasts after the contact, fading out. */
  frames: number;
  /** Fraction of its fall speed it leaves with, away from the surface;
      zero sits where it landed. */
  bounce: number;
  /** Carries on along its path, fading, untouched by the thing it met;
      any overlap counts, not only a landing. */
  pass?: boolean;
}

interface Rule {
  count: number;
  wind: (random: Random) => number;
  speed: (random: Random) => number;
  /** Sideways motion per frame, scaled by how much gravity is felt. */
  sway: (p: Particle, wind: number) => number;
  onTile: Contact;
  onBody: Contact;
}

/** The gravity the weather answers to. A scene at zero gravity still reads
    as a side view, so its weather falls as under the default. */
export function weatherGravity(sceneGravity: number): number {
  return sceneGravity === 0 ? PLATFORM_GRAVITY : sceneGravity;
}

// How far the felt gravity closes on the scene's each frame.
const GRAVITY_EASE = 0.06;
// Frames a particle takes to reach its fall speed under default gravity.
const SPEED_UP_FRAMES = 8;

const between = (random: Random, min: number, max: number) =>
  min + random() * (max - min);

const RULES: Record<Exclude<WeatherKind, 'none'>, Rule> = {
  rain: {
    count: 80,
    wind: random => between(random, -0.6, 0.6),
    speed: random => between(random, 7, 10),
    sway: (p, wind) => wind,
    onTile: {frames: 8, bounce: 0.35},
    onBody: {frames: 8, bounce: 0.35},
  },
  snow: {
    count: 40,
    wind: random => between(random, -0.3, 0.3),
    speed: random => between(random, 0.8, 1.6),
    sway: (p, wind) => wind + Math.sin(p.age * 0.05 + p.phase) * 0.5,
    onTile: {frames: 30, bounce: 0},
    onBody: {frames: 10, bounce: 0, pass: true},
  },
};

export function weatherCount(kind: WeatherKind): number {
  return kind === 'none' ? 0 : RULES[kind].count;
}

// 1 falling down, -1 up; a weightless pool keeps its last direction.
function flow(weather: Weather): number {
  return weather.gravity < 0 ? -1 : 1;
}

// A fresh particle at height `y`, falling with the flow.
function particleAt(
  rule: Rule,
  scene: WeatherScene,
  y: number,
  random: Random
): Particle {
  return {
    x: between(random, 0, scene.width),
    y,
    vx: 0,
    vy: 0,
    speed: rule.speed(random),
    age: 0,
    state: 'falling',
    settleFrames: 0,
    holds: false,
    alpha: 1,
    phase: random() * Math.PI * 2,
  };
}

// A particle coming around: up to a world's height beyond the edge the
// flow comes from, spread so the pool arrives as a drizzle, not a wave.
function respawn(
  rule: Rule,
  scene: WeatherScene,
  weather: Weather,
  random: Random
): Particle {
  const beyond = between(random, 4, scene.height);
  const y = flow(weather) > 0 ? -beyond : scene.height + beyond;
  return particleAt(rule, scene, y, random);
}

/** A full pool for the kind, already under way: spread from a world's
    height before the edge to the far edge, so the first frame is weather,
    not a front arriving. */
export function createWeather(
  kind: WeatherKind,
  scene: WeatherScene,
  random: Random = Math.random
): Weather {
  const gravity = weatherGravity(scene.gravity);
  if (kind === 'none') {
    return {kind, particles: [], wind: 0, gravity};
  }
  const rule = RULES[kind];
  const weather: Weather = {
    kind,
    particles: [],
    wind: rule.wind(random),
    gravity,
  };
  const down = flow(weather);
  const felt = Math.min(1, Math.abs(gravity) / PLATFORM_GRAVITY);
  weather.particles = Array.from({length: rule.count}, () => {
    const along = between(random, -scene.height, scene.height);
    const p = particleAt(
      rule,
      scene,
      down > 0 ? along : scene.height - along,
      random
    );
    p.vy = down * p.speed * felt;
    return p;
  });
  return weather;
}

/** The box a character or object presents to the weather: its
    feet-anchored body, as the platform resolver measures a player. */
export function bodyBox(sprite: {
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

/** The surface facing the flow that a falling particle crossed this frame,
    if any: tops when falling down, undersides when falling up. */
export function landedOn(
  boxes: Box[],
  down: number,
  x: number,
  fromY: number,
  toY: number
): {box: Box; y: number} | undefined {
  let hit: {box: Box; y: number} | undefined;
  for (const box of boxes) {
    const surface = box.y - down * box.halfH;
    const crossed =
      down > 0
        ? fromY <= surface && toY >= surface
        : fromY >= surface && toY <= surface;
    if (
      crossed &&
      x >= box.x - box.halfW &&
      x <= box.x + box.halfW &&
      (!hit || (surface - hit.y) * down < 0)
    ) {
      hit = {box, y: surface};
    }
  }
  return hit;
}

/** Push a particle that drifted into a box through its side back out to
    the nearer side, so it slides along the face instead of falling inside
    it. */
export function keepOutside(boxes: Box[], p: {x: number; y: number}): void {
  for (const box of boxes) {
    if (
      Math.abs(p.x - box.x) < box.halfW &&
      Math.abs(p.y - box.y) < box.halfH
    ) {
      p.x = p.x < box.x ? box.x - box.halfW - 1 : box.x + box.halfW + 1;
    }
  }
}

function settle(p: Particle, y: number, down: number, contact: Contact) {
  p.state = 'settling';
  p.age = 0;
  p.settleFrames = contact.frames;
  if (contact.pass) {
    p.holds = false;
    return;
  }
  p.y = y;
  p.holds = contact.bounce === 0;
  p.vy = -down * Math.abs(p.vy) * contact.bounce;
  if (p.holds) {
    p.vx = 0;
  }
}

function overlaps(boxes: Box[], p: Particle): boolean {
  return boxes.some(
    box =>
      Math.abs(p.x - box.x) < box.halfW && Math.abs(p.y - box.y) < box.halfH
  );
}

/**
 * One frame. The felt gravity eases toward the scene's. Falling particles
 * speed up toward their fall speed under that gravity, move, land on tiles
 * and bodies and do what their kind does there, and come back around once
 * they leave the world or finish settling.
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
  const gravity = weatherGravity(scene.gravity);
  weather.gravity += (gravity - weather.gravity) * GRAVITY_EASE;
  if (Math.abs(weather.gravity - gravity) < 0.005) {
    weather.gravity = gravity;
  }
  const g = weather.gravity;
  const felt = Math.abs(g) / PLATFORM_GRAVITY;
  const down = flow(weather);
  weather.particles.forEach((p, i) => {
    p.age++;
    if (!p.holds) {
      // Toward the fall speed this gravity gives, at this gravity's pace;
      // a floor on the pace keeps a faint gravity from stalling the turn.
      const target = p.speed * (g / PLATFORM_GRAVITY);
      const step = (p.speed / SPEED_UP_FRAMES) * Math.max(felt, 0.15);
      p.vy += Math.max(-step, Math.min(step, target - p.vy));
    }
    if (p.state === 'settling') {
      p.alpha = 1 - p.age / p.settleFrames;
      if (p.age >= p.settleFrames) {
        weather.particles[i] = respawn(rule, scene, weather, random);
        return;
      }
      if (!p.holds) {
        p.x += p.vx;
        p.y += p.vy;
      }
      return;
    }
    const fromY = p.y;
    p.x += rule.sway(p, weather.wind) * felt + p.vx;
    p.y += p.vy;
    if (rule.onBody.pass) {
      if (overlaps(scene.bodies, p)) {
        settle(p, p.y, down, rule.onBody);
        return;
      }
    } else if (p.vy * down > 0) {
      const onBody = landedOn(scene.bodies, down, p.x, fromY, p.y);
      if (onBody) {
        settle(p, onBody.y, down, rule.onBody);
        p.vx += (p.x < onBody.box.x ? -1 : 1) * rule.onBody.bounce * 2;
        return;
      }
    }
    // Only a particle moving with the flow lands; one on its way back out
    // after a bounce passes.
    if (p.vy * down > 0) {
      const onTile = landedOn(scene.walls, down, p.x, fromY, p.y);
      if (onTile) {
        settle(p, onTile.y, down, rule.onTile);
        return;
      }
    }
    keepOutside(scene.walls, p);
    if (!rule.onBody.pass) {
      keepOutside(scene.bodies, p);
    }
    const gone = down > 0 ? p.y > scene.height + 8 : p.y < -8;
    if (gone || p.x < -8 || p.x > scene.width + 8) {
      weather.particles[i] = respawn(rule, scene, weather, random);
    }
  });
}

/** The p5 calls the drawing needs. */
export interface WeatherCanvas {
  push(): void;
  pop(): void;
  noStroke(): void;
  stroke(r: number, g: number, b: number, a?: number): void;
  strokeWeight(w: number): void;
  fill(r: number, g: number, b: number, a?: number): void;
  line(x1: number, y1: number, x2: number, y2: number): void;
  ellipse(x: number, y: number, w: number, h?: number): void;
}

/** Draw the pool in world coordinates: a streak per raindrop along its
    motion, a dot per flake, both fading as they settle. Shapes stand in for
    art for now. */
export function drawWeather(p5: WeatherCanvas, weather: Weather): void {
  if (weather.kind === 'none') {
    return;
  }
  p5.push();
  for (const p of weather.particles) {
    const a = Math.max(0, Math.min(1, p.alpha)) * 255;
    if (weather.kind === 'rain') {
      p5.stroke(120, 160, 230, a * 0.8);
      p5.strokeWeight(2);
      // A streak the length of the motion; a slow drop is a tick.
      p5.line(p.x, p.y, p.x - p.vx * 1.5, p.y - p.vy * 1.5);
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
