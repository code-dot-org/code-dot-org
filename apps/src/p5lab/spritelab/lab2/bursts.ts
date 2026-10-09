// A burst: sparks, confetti or dust flung out from a sprite, slowing in
// the air, drawn down by the scene's gravity, and gone in a moment. A
// visual flourish: it passes through tiles and bodies, and nothing of it
// is left to pick up. Several can be in flight. Particles are plain
// records, not sprites.

import {PhysicsBox, PLATFORM_GRAVITY} from './platformPhysics';
import {Random, weatherGravity} from './weather';

export const BURST_LOOKS = ['sparks', 'confetti', 'dust'] as const;
export type BurstLook = (typeof BURST_LOOKS)[number];

export function isBurstLook(value: unknown): value is BurstLook {
  return BURST_LOOKS.includes(value as BurstLook);
}

export interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Frames lived; gone at `life`, fading over the last part. */
  age: number;
  life: number;
  /** Drawn size in world pixels. */
  size: number;
  rotation: number;
  spin: number;
  /** Per-particle phase for confetti's flutter. */
  phase: number;
  /** The tint the particle takes, 0..255 each. */
  color: [number, number, number];
}

export interface Burst {
  look: BurstLook;
  particles: BurstParticle[];
}

/** Particles in flight at once, over every burst. */
export const MAX_BURST_PARTICLES = 400;
export const MAX_BURST_COUNT = 100;

// The share of a particle's life over which it fades out.
const FADE_SHARE = 0.5;

/** The particle images, white, tinted per particle when drawn. */
export type BurstShape = 'spark' | 'puff';

/** How a look moves and shows. */
interface Look {
  /** Where on the sprite the particles start. */
  origin: 'center' | 'feet';
  /** Launch directions: every way, or within this angle of level, either
      side. */
  fan?: number;
  /** Start positions scattered this far either side of the origin, so a
      low burst reads as a cloud rather than one point. */
  spread: number;
  speed: [number, number];
  /** Launch push against gravity. */
  lift: number;
  /** Velocity kept per frame. */
  drag: number;
  /** Fall acceleration per frame under the default gravity. */
  fall: number;
  life: [number, number];
  size: [number, number];
  /** Drawn size at the end of life, as a multiple of the start. */
  grow: number;
  spin: [number, number];
  /** An image, or a tumbling scrap of paper. */
  shape: BurstShape | 'paper';
  palette: [number, number, number][];
}

const LOOKS: Record<BurstLook, Look> = {
  // Hot, fast and brief, like metal sparks.
  sparks: {
    origin: 'center',
    spread: 0,
    speed: [5, 12],
    lift: 2,
    drag: 0.95,
    fall: 0.25,
    life: [25, 40],
    size: [10, 18],
    grow: 1,
    spin: [-0.3, 0.3],
    shape: 'spark',
    palette: [
      [255, 255, 255],
      [255, 240, 150],
      [255, 200, 60],
      [255, 150, 40],
    ],
  },
  // Light scraps that tumble and float down.
  confetti: {
    origin: 'center',
    spread: 0,
    speed: [3, 8],
    lift: 3,
    drag: 0.97,
    fall: 0.08,
    life: [70, 110],
    size: [6, 11],
    grow: 1,
    spin: [-0.25, 0.25],
    shape: 'paper',
    palette: [
      [255, 90, 90],
      [255, 190, 50],
      [90, 220, 120],
      [80, 170, 255],
      [200, 110, 255],
      [255, 120, 200],
    ],
  },
  // Puffs kicked up at the feet: out to the sides, a little lift, and they
  // swell as they thin out.
  dust: {
    origin: 'feet',
    fan: 0.5,
    spread: 8,
    speed: [0.6, 2.2],
    lift: 0.4,
    drag: 0.9,
    fall: 0,
    life: [22, 36],
    size: [8, 14],
    grow: 2.2,
    spin: [-0.05, 0.05],
    shape: 'puff',
    palette: [
      [214, 205, 190],
      [228, 222, 210],
      [196, 188, 174],
      [205, 196, 180],
    ],
  },
};

const between = (random: Random, [min, max]: [number, number]) =>
  min + random() * (max - min);

/** `total` shared exactly among `parts`: the first parts take the extra. */
export function shareOut(total: number, parts: number): number[] {
  const base = Math.floor(total / parts);
  const extra = total % parts;
  return Array.from({length: parts}, (_, i) => base + (i < extra ? 1 : 0));
}

/** Where a look's burst starts on a sprite: its centre, or its feet, the
    edge the scene's gravity presses it against. */
export function burstOrigin(
  look: BurstLook,
  sprite: PhysicsBox,
  gravity: number
): {x: number; y: number} {
  const {x, y} = sprite.position;
  if (LOOKS[look].origin === 'center') {
    return {x, y};
  }
  const down = weatherGravity(gravity) < 0 ? -1 : 1;
  return {x, y: y + (down * sprite.height * sprite.scale) / 2};
}

/** A burst of `count` particles from a point, flung out in every direction
    (or, for a fanned look, out to either side) with a little lift against
    gravity. */
export function createBurst(
  look: BurstLook,
  count: number,
  origin: {x: number; y: number},
  gravity: number,
  random: Random = Math.random
): Burst {
  const rule = LOOKS[look];
  const up = weatherGravity(gravity) < 0 ? 1 : -1;
  const particles = Array.from({length: count}, () => {
    const angle =
      rule.fan === undefined
        ? random() * Math.PI * 2
        : (random() < 0.5 ? 0 : Math.PI) + (random() * 2 - 1) * rule.fan;
    const speed = between(random, rule.speed);
    return {
      x: origin.x + (random() * 2 - 1) * rule.spread,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + up * rule.lift,
      age: 0,
      life: Math.round(between(random, rule.life)),
      size: between(random, rule.size),
      rotation: random() * Math.PI * 2,
      spin: between(random, rule.spin),
      phase: random() * Math.PI * 2,
      color:
        rule.palette[
          Math.floor(random() * rule.palette.length) % rule.palette.length
        ],
    };
  });
  return {look, particles};
}

export interface BurstScene {
  width: number;
  height: number;
  gravity: number;
}

/**
 * One frame for one burst. Particles slow in the air, fall with the scene's
 * gravity at their look's rate, spin, and are dropped once their life is up
 * or they leave the world. Returns whether anything is left.
 */
export function stepBurst(burst: Burst, scene: BurstScene): boolean {
  const rule = LOOKS[burst.look];
  const g = weatherGravity(scene.gravity);
  const accel = (rule.fall * g) / PLATFORM_GRAVITY;
  const margin = 40;
  burst.particles = burst.particles.filter(p => {
    p.age++;
    if (p.age >= p.life) {
      return false;
    }
    p.vx *= rule.drag;
    p.vy = p.vy * rule.drag + accel;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    return (
      p.x > -margin &&
      p.x < scene.width + margin &&
      p.y > -margin &&
      p.y < scene.height + margin
    );
  });
  return burst.particles.length > 0;
}

/** 1 at full strength, easing to 0 over the last part of the particle's
    life, as its motion dies away. */
export function burstAlpha(p: BurstParticle): number {
  return Math.max(0, Math.min(1, (p.life - p.age) / (p.life * FADE_SHARE)));
}

/** The p5 calls the drawing needs. The fade goes through the canvas's own
    alpha: in this p5 a tint's alpha is tint strength, not opacity. */
export interface BurstCanvas {
  push(): void;
  pop(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  scale(x: number, y: number): void;
  imageMode(mode: unknown): void;
  rectMode(mode: unknown): void;
  image(img: unknown, x: number, y: number, w: number, h: number): void;
  noStroke(): void;
  fill(r: number, g: number, b: number, a?: number): void;
  rect(x: number, y: number, w: number, h: number): void;
  ellipse(x: number, y: number, w: number, h?: number): void;
  drawingContext: {globalAlpha: number};
  CENTER: unknown;
}

/** A particle image already tinted a colour, or nothing until it has
    loaded. */
export type ImageFor = (
  shape: BurstShape,
  color: [number, number, number]
) => unknown;

/** Draw every burst's particles: sparks as the spark image in their colour,
    shrinking as they fade; dust as the puff image, swelling as it fades (a
    dot until an image has loaded); confetti as scraps of paper that tumble
    by narrowing and widening. */
export function drawBursts(
  p5: BurstCanvas,
  bursts: Burst[],
  imageFor: ImageFor
): void {
  if (!bursts.length) {
    return;
  }
  p5.push();
  p5.imageMode(p5.CENTER);
  p5.rectMode(p5.CENTER);
  p5.noStroke();
  const context = p5.drawingContext;
  const alphaBefore = context.globalAlpha;
  for (const burst of bursts) {
    const {shape, grow} = LOOKS[burst.look];
    for (const p of burst.particles) {
      const alpha = burstAlpha(p);
      const [r, g, b] = p.color;
      p5.push();
      p5.translate(p.x, p.y);
      p5.rotate(p.rotation);
      context.globalAlpha = alphaBefore * alpha;
      if (shape === 'paper') {
        // A scrap seen edge-on and face-on by turns.
        p5.scale(Math.max(0.15, Math.abs(Math.cos(p.age * 0.18 + p.phase))), 1);
        p5.fill(r, g, b);
        p5.rect(0, 0, p.size, p.size * 0.6);
      } else {
        const size =
          shape === 'spark'
            ? p.size * (0.4 + 0.6 * alpha)
            : p.size * (1 + ((grow - 1) * p.age) / p.life);
        const image = imageFor(shape, p.color);
        if (image) {
          p5.image(image, 0, 0, size, size);
        } else {
          p5.fill(r, g, b);
          p5.ellipse(0, 0, size * 0.4, size * 0.4);
        }
      }
      p5.pop();
    }
  }
  context.globalAlpha = alphaBefore;
  p5.pop();
}
