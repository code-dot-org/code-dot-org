// A burst: a handful of a project's image flung out from a point, falling
// with the scene's gravity, bouncing off tiles and bodies, and fading away.
// One-shot, unlike weather; several can be in flight, and a second burst
// from the same place adds to the first. Particles are plain records, not
// sprites.

import {PLATFORM_GRAVITY} from './platformPhysics';
import {
  Box,
  keepOutside,
  landedOn,
  Random,
  weatherGravity,
  WeatherScene,
} from './weather';

export interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Frames lived; the particle fades over its last third. */
  age: number;
  life: number;
  /** Drawn size in world pixels. */
  size: number;
  rotation: number;
  spin: number;
  bounces: number;
}

export interface Burst {
  /** The project image the particles show. */
  image: string;
  particles: BurstParticle[];
}

/** Particles in flight at once, over every burst. */
export const MAX_BURST_PARTICLES = 400;
export const MAX_BURST_COUNT = 100;

// Fall acceleration per frame under the default gravity, and the fastest
// a particle falls.
const FALL_ACCEL = 0.45;
const TERMINAL = 10;
// Energy kept on a bounce, and how many bounces before the particle stays
// down.
const BOUNCE = 0.5;
const MAX_BOUNCES = 3;

const between = (random: Random, min: number, max: number) =>
  min + random() * (max - min);

/** A burst of `count` particles from a point, flung out in every direction
    with a lift against gravity so the arc reads. */
export function createBurst(
  image: string,
  count: number,
  origin: {x: number; y: number},
  gravity: number,
  random: Random = Math.random
): Burst {
  const up = weatherGravity(gravity) < 0 ? 1 : -1;
  const particles = Array.from({length: count}, () => {
    const angle = random() * Math.PI * 2;
    const speed = between(random, 3, 8);
    return {
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed + up * 3,
      age: 0,
      life: Math.round(between(random, 60, 90)),
      size: between(random, 14, 24),
      rotation: random() * Math.PI * 2,
      spin: between(random, -0.2, 0.2),
      bounces: 0,
    };
  });
  return {image, particles};
}

/** Where the particles fall through, as the weather sees it, plus whether
    the stage's bottom edge is a floor to land on (a story scene, which has
    no tiles). */
export type BurstScene = Pick<
  WeatherScene,
  'width' | 'height' | 'walls' | 'bodies' | 'gravity'
> & {floor?: boolean};

/**
 * One frame for one burst. Particles fall with the scene's gravity, bounce
 * off the tops of tiles and bodies losing energy each time, slide off the
 * sides, spin, and are dropped once their life is up or they leave the
 * world. Returns whether anything is left.
 */
export function stepBurst(burst: Burst, scene: BurstScene): boolean {
  const g = weatherGravity(scene.gravity);
  const down = g < 0 ? -1 : 1;
  const accel = (FALL_ACCEL * g) / PLATFORM_GRAVITY;
  burst.particles = burst.particles.filter(p => {
    p.age++;
    if (p.age >= p.life) {
      return false;
    }
    p.vy = Math.max(-TERMINAL, Math.min(TERMINAL, p.vy + accel));
    const fromY = p.y;
    p.x += p.vx;
    p.y += p.vy;
    p.rotation += p.spin;
    if (p.vy * down > 0) {
      const boxes: Box[] = [...scene.walls, ...scene.bodies];
      if (scene.floor && down > 0) {
        boxes.push({
          x: scene.width / 2,
          y: scene.height + scene.height / 2,
          halfW: scene.width,
          halfH: scene.height / 2,
        });
      }
      const hit = landedOn(boxes, down, p.x, fromY, p.y);
      if (hit) {
        p.y = hit.y;
        p.bounces++;
        if (p.bounces > MAX_BOUNCES) {
          p.vy = 0;
          p.vx = 0;
          p.spin = 0;
        } else {
          p.vy = -down * Math.abs(p.vy) * BOUNCE;
          p.vx *= 0.7;
          p.spin *= 0.5;
        }
      }
    }
    keepOutside(scene.walls, p);
    const margin = 40;
    return (
      p.x > -margin &&
      p.x < scene.width + margin &&
      p.y > -margin &&
      p.y < scene.height + margin
    );
  });
  return burst.particles.length > 0;
}

/** 1 at full strength, down to 0 over the particle's last third. */
export function burstAlpha(p: BurstParticle): number {
  const fadeFrom = p.life * (2 / 3);
  return p.age < fadeFrom ? 1 : 1 - (p.age - fadeFrom) / (p.life - fadeFrom);
}

/** A loaded image to draw: whole, or one frame cut from a sheet. */
export interface ParticleImage {
  image: unknown;
  frame?: {x: number; y: number; width: number; height: number};
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
  image(
    img: unknown,
    x: number,
    y: number,
    w: number,
    h: number,
    sx?: number,
    sy?: number,
    sw?: number,
    sh?: number
  ): void;
  noStroke(): void;
  fill(r: number, g: number, b: number, a?: number): void;
  ellipse(x: number, y: number, w: number, h?: number): void;
  CENTER: unknown;
}

/** Draw every burst's particles as its image, scaled to particle size,
    spinning and fading; a dot where the image is not loaded. */
export function drawBursts(
  p5: BurstCanvas,
  bursts: Burst[],
  imageFor: (name: string) => ParticleImage | undefined
): void {
  if (!bursts.length) {
    return;
  }
  p5.push();
  p5.imageMode(p5.CENTER);
  p5.noStroke();
  for (const burst of bursts) {
    const img = imageFor(burst.image);
    for (const p of burst.particles) {
      const a = burstAlpha(p) * 255;
      p5.push();
      p5.translate(p.x, p.y);
      p5.rotate(p.rotation);
      if (img?.frame) {
        const {x, y, width, height} = img.frame;
        p5.tint(255, 255, 255, a);
        p5.image(img.image, 0, 0, p.size, p.size, x, y, width, height);
      } else if (img) {
        p5.tint(255, 255, 255, a);
        p5.image(img.image, 0, 0, p.size, p.size);
      } else {
        p5.fill(255, 200, 60, a);
        p5.ellipse(0, 0, p.size * 0.5, p.size * 0.5);
      }
      p5.pop();
    }
  }
  p5.noTint();
  p5.pop();
}
