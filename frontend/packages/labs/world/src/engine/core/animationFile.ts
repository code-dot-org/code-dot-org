// Parsing + validation for a learner's animation file (INTERFACE.md
// §Animations). An animation file is plain JSON — the same `.json` the compiler
// already bundles — discriminated by `"type": "animation"`:
//
//   { "type": "animation", "animations": { "walk": { "frames": [...] } } }
//
// The learner imports it and registers it: `world.useAnimations(
// parseAnimationFile(Walk))`. `parseAnimationFile` turns the untyped JSON into
// the engine's `AnimationDef` map, throwing a clear error on malformed input so
// a typo surfaces as a message rather than a silent non-animation.

import type {AnimationDef, AnimationFrame, Cell} from './animationTypes';

/** The on-disk shape of an animation `.json` file. */
export interface AnimationFile {
  type: 'animation';
  animations: Record<string, AnimationDef>;
}

function fail(message: string): never {
  throw new Error(`invalid animation file: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseCell(
  id: string,
  index: number,
  value: unknown,
): Cell | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (!isRecord(value)) {
    fail(`"${id}" frame ${index} position must be an object`);
  }
  for (const k of ['x', 'y', 'width', 'height'] as const) {
    if (typeof value[k] !== 'number') {
      fail(`"${id}" frame ${index} position.${k} must be a number`);
    }
  }
  const cell = value as Record<'x' | 'y' | 'width' | 'height', number>;
  return {x: cell.x, y: cell.y, width: cell.width, height: cell.height};
}

function parseFrame(id: string, index: number, value: unknown): AnimationFrame {
  if (!isRecord(value)) {
    fail(`"${id}" frame ${index} must be an object`);
  }
  if (typeof value.sprite !== 'string' || value.sprite === '') {
    fail(`"${id}" frame ${index} needs a non-empty "sprite"`);
  }
  // A frame need not say: without one it is held at the animation's frameRate
  // (animationTypes.frameDelay). What it must not be is nonsense.
  if (
    value.delay !== undefined &&
    (typeof value.delay !== 'number' || !Number.isFinite(value.delay))
  ) {
    fail(`"${id}" frame ${index} "delay" must be a number`);
  }
  let offset: {x: number; y: number} | undefined;
  if (value.offset !== undefined) {
    if (
      !isRecord(value.offset) ||
      typeof value.offset.x !== 'number' ||
      typeof value.offset.y !== 'number'
    ) {
      fail(`"${id}" frame ${index} offset must be {x, y} numbers`);
    }
    offset = {x: value.offset.x, y: value.offset.y};
  }
  if (value.scale !== undefined && typeof value.scale !== 'number') {
    fail(`"${id}" frame ${index} scale must be a number`);
  }
  return {
    sprite: value.sprite,
    delay: typeof value.delay === 'number' ? value.delay : undefined,
    position: parseCell(id, index, value.position),
    offset,
    scale: typeof value.scale === 'number' ? value.scale : undefined,
  };
}

function parseDef(id: string, value: unknown): AnimationDef {
  if (!isRecord(value)) {
    fail(`animation "${id}" must be an object`);
  }
  if (!Array.isArray(value.frames) || value.frames.length === 0) {
    fail(`animation "${id}" needs a non-empty "frames" array`);
  }
  if (
    value.frameRate !== undefined &&
    (typeof value.frameRate !== 'number' ||
      !Number.isFinite(value.frameRate) ||
      value.frameRate <= 0)
  ) {
    fail(`animation "${id}" "frameRate" must be a positive number`);
  }
  return {
    name: typeof value.name === 'string' ? value.name : undefined,
    loop: typeof value.loop === 'boolean' ? value.loop : undefined,
    frameRate:
      typeof value.frameRate === 'number' ? value.frameRate : undefined,
    frames: value.frames.map((frame, i) => parseFrame(id, i, frame)),
  };
}

/** Validate an imported animation file and return its animations, by id. */
export function parseAnimationFile(raw: unknown): Record<string, AnimationDef> {
  if (!isRecord(raw)) {
    fail('expected an object');
  }
  if (raw.type !== 'animation') {
    fail(`expected type "animation", got ${JSON.stringify(raw.type)}`);
  }
  if (!isRecord(raw.animations)) {
    fail('missing "animations" map');
  }
  const out: Record<string, AnimationDef> = {};
  for (const [id, def] of Object.entries(raw.animations)) {
    out[id] = parseDef(id, def);
  }
  return out;
}
