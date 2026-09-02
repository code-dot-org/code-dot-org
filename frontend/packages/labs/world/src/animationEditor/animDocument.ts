// The `.anim` document, as the editor holds it and writes it back.
//
// Separated from the editor for one rule that is easy to break and hard to
// notice: WHAT THE EDITOR DOES NOT UNDERSTAND, IT CARRIES. A file names itself
// (`AnimationFile.name`, the words the import dialog offered it under), and
// nothing in this editor edits that name — so a parse that dropped it and a
// serialize that never wrote it would take the name off the file the first
// time anybody moved a frame. That is a round trip, and a round trip is worth
// a test of its own.

import type {CellRect} from './sheetFrames';

/** A source rectangle within a spritesheet — what a frame draws (sheetFrames). */
export type Cell = CellRect;

export interface Frame {
  sprite: string;
  /** This frame's own timing, when it is an exception to the animation's. */
  delay?: number;
  scale?: number;
  offset?: {x: number; y: number};
  position?: Cell;
  /** Client-only stable id (drag/react keys, draft keys); stripped on save. */
  __id: string;
}
export interface AnimDef {
  loop?: boolean;
  /** Frames per second, for the frames that do not name a delay (timing.ts). */
  frameRate?: number;
  frames: Frame[];
}
export interface AnimFile {
  type: 'animation';
  /** What the file calls itself, carried through untouched (`AnimationFile`). */
  name?: string;
  animations: Record<string, AnimDef>;
}

/** A client-only stable id: React keys, drag identity, draft rows. */
export const uid = (): string => crypto.randomUUID();

/** Parse the `.anim` JSON leniently; the editor always writes it back valid. */
export function parseAnim(contents: string): AnimFile {
  if (contents.trim()) {
    try {
      const raw = JSON.parse(contents) as {
        type?: unknown;
        name?: unknown;
        animations?: Record<string, AnimDef>;
      };
      if (
        raw.type === 'animation' &&
        raw.animations &&
        typeof raw.animations === 'object'
      ) {
        const animations: Record<string, AnimDef> = {};
        for (const [id, def] of Object.entries(raw.animations)) {
          animations[id] = {
            loop: def.loop,
            frameRate: def.frameRate,
            frames: (def.frames ?? []).map(f => ({...f, __id: uid()})),
          };
        }
        return {
          type: 'animation',
          // Read and written back, though nothing here edits it: an editor
          // that dropped it would take the name off the file the first time
          // anybody moved a frame.
          ...(typeof raw.name === 'string' ? {name: raw.name} : {}),
          animations,
        };
      }
    } catch {
      // Malformed — start empty rather than throw; the file rewrites on edit.
    }
  }
  return {type: 'animation', animations: {}};
}

/** Drop client-only fields and defaults so the written file stays minimal (the
 *  hand-authored shape: no `__id`, no zero offset, no unit scale, no absent
 *  cell). `out` is rebuilt from known keys, so `__id` never leaks. */
function cleanFrame(f: Frame): Omit<Frame, '__id'> {
  const out: Omit<Frame, '__id'> = {sprite: f.sprite};
  // Only when it differs from the animation's rate: a frame that says nothing
  // is a frame that follows (timing.ts).
  if (typeof f.delay === 'number') {
    out.delay = f.delay;
  }
  if (f.position) {
    out.position = f.position;
  }
  if (f.offset && (f.offset.x !== 0 || f.offset.y !== 0)) {
    out.offset = f.offset;
  }
  if (f.scale !== undefined && f.scale !== 1) {
    out.scale = f.scale;
  }
  return out;
}

export function serialize(doc: AnimFile): string {
  const animations: Record<string, object> = {};
  for (const [id, def] of Object.entries(doc.animations)) {
    animations[id] = {
      ...(def.loop === false ? {loop: false} : {}),
      ...(def.frameRate ? {frameRate: def.frameRate} : {}),
      frames: def.frames.map(cleanFrame),
    };
  }
  return JSON.stringify(
    {type: 'animation', ...(doc.name ? {name: doc.name} : {}), animations},
    null,
    2,
  );
}
