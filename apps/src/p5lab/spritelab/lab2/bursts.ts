// A burst: sparks flung out from a point, slowing in the air, drawn down by
// the scene's gravity, and gone in under a second. A visual flourish, like
// confetti or metal sparks: it passes through tiles and bodies, and nothing
// of it is left to pick up. Several can be in flight. Particles are plain
// records, not sprites.

import {PLATFORM_GRAVITY} from './platformPhysics';
import {Random, weatherGravity} from './weather';

export const BURST_LOOKS = ['sparks', 'confetti'] as const;
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
  /** The tint the shared spark image takes, 0..255 each. */
  color: [number, number, number];
}

export interface Burst {
  look: BurstLook;
  particles: BurstParticle[];
}

/** Particles in flight at once, over every burst. */
export const MAX_BURST_PARTICLES = 400;
export const MAX_BURST_COUNT = 100;

// Fall acceleration per frame under the default gravity, air drag per
// frame, and the share of a particle's life over which it fades out.
const FALL_ACCEL = 0.25;
const DRAG = 0.96;
const FADE_SHARE = 0.4;

const between = (random: Random, min: number, max: number) =>
  min + random() * (max - min);

// Each look's tints: hot whites and golds for sparks, a party for confetti.
const PALETTES: Record<BurstLook, [number, number, number][]> = {
  sparks: [
    [255, 255, 255],
    [255, 240, 150],
    [255, 200, 60],
    [255, 150, 40],
  ],
  confetti: [
    [255, 90, 90],
    [255, 190, 50],
    [90, 220, 120],
    [80, 170, 255],
    [200, 110, 255],
    [255, 120, 200],
  ],
};

/** A burst of `count` particles from a point, flung out in every direction
    with a little lift against gravity. */
export function createBurst(
  look: BurstLook,
  count: number,
  origin: {x: number; y: number},
  gravity: number,
  random: Random = Math.random
): Burst {
  const up = weatherGravity(gravity) < 0 ? 1 : -1;
  const palette = PALETTES[look];
  const particles = Array.from({length: count}, () => {
    const angle = random() * Math.PI * 2;
    const speed = between(random, 4, 11);
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + up * 2,
      age: 0,
      life: Math.round(between(random, 30, 50)),
      size: between(random, 10, 18),
      rotation: random() * Math.PI * 2,
      spin: between(random, -0.3, 0.3),
      color: palette[Math.floor(random() * palette.length) % palette.length],
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
 * gravity, spin, and are dropped once their life is up or they leave the
 * world. Returns whether anything is left.
 */
export function stepBurst(burst: Burst, scene: BurstScene): boolean {
  const g = weatherGravity(scene.gravity);
  const accel = (FALL_ACCEL * g) / PLATFORM_GRAVITY;
  const margin = 40;
  burst.particles = burst.particles.filter(p => {
    p.age++;
    if (p.age >= p.life) {
      return false;
    }
    p.vx *= DRAG;
    p.vy = p.vy * DRAG + accel;
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

/** The p5 calls the drawing needs. */
export interface BurstCanvas {
  push(): void;
  pop(): void;
  translate(x: number, y: number): void;
  rotate(angle: number): void;
  tint(r: number, g: number, b: number, a?: number): void;
  noTint(): void;
  imageMode(mode: unknown): void;
  image(img: unknown, x: number, y: number, w: number, h: number): void;
  noStroke(): void;
  fill(r: number, g: number, b: number, a?: number): void;
  ellipse(x: number, y: number, w: number, h?: number): void;
  CENTER: unknown;
}

/** Draw every burst's particles as the spark image, tinted, spinning and
    fading; a tinted dot until the image has loaded. */
export function drawBursts(
  p5: BurstCanvas,
  bursts: Burst[],
  spark: unknown
): void {
  if (!bursts.length) {
    return;
  }
  p5.push();
  p5.imageMode(p5.CENTER);
  p5.noStroke();
  for (const burst of bursts) {
    for (const p of burst.particles) {
      const a = burstAlpha(p) * 255;
      const [r, g, b] = p.color;
      p5.push();
      p5.translate(p.x, p.y);
      p5.rotate(p.rotation);
      if (spark) {
        p5.tint(r, g, b, a);
        p5.image(spark, 0, 0, p.size, p.size);
      } else {
        p5.fill(r, g, b, a);
        p5.ellipse(0, 0, p.size * 0.4, p.size * 0.4);
      }
      p5.pop();
    }
  }
  p5.noTint();
  p5.pop();
}
