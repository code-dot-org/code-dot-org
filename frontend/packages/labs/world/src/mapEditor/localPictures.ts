// A placement's picture, painted here from its actor's file — no sandbox.
//
// The sandbox paints a placement by compiling the project, instantiating the
// kind and running its drawing in the engine, and answers a round trip later.
// That is the truth, and it is a beat behind every keystroke in the inspector.
// A `define drawing` cannot set anything, so the same picture can be had by
// READING the rows and resolving each property against the actor's defaults,
// its own `set` rows and the placement's overrides (`actors/preview/
// drawingReader`), then painting the commands with the driver's own painter.
// Synchronous, per keystroke, and no project has to run.
//
// THE SANDBOX STILL WINS WHERE THE READING COULD NOT FINISH. A drawing that
// reads the time, or a rule's live state, or a block the reader has not met,
// comes back marked incomplete; the editor keeps asking the sandbox for those
// and shows the reading only until the sandbox answers. For the drawings the
// reader finishes — every interface actor's but the Text Input's — nothing is
// asked of the sandbox at all.

import {
  declaresDrawing,
  readDrawing,
  type Files,
  type Measure,
  type ReadDrawing,
} from '../actors/preview/drawingReader';
import {placementKey} from '../blockly/mapPlacements';
import {APPEARANCE} from '../engine/core/spatialKeys';
import {paintDrawing} from '../runtime/driver/paintDrawing';
import type {ActorSchema} from '../runtime/messages';

import type {MapDoc} from './mapModel';

/** One picture the reader produced: what to draw, how big, and how sure. */
export interface LocalPicture {
  /** Absent where nothing here can paint — a test, a worker. */
  canvas?: HTMLCanvasElement;
  size: {width: number; height: number};
  complete: boolean;
}

/** The pictures the reader could produce for a map, by placement key or kind. */
export interface LocalPictures {
  pictures: Record<string, HTMLCanvasElement>;
  sizes: Record<string, {width: number; height: number}>;
  /** The keys whose reading met nothing it did not know. */
  complete: Set<string>;
}

/** The image a `draw image` names, if the editor has it decoded. */
export type ImageFor = (sprite: string) => CanvasImageSource | undefined;

/** A painter for one drawing, replaceable where there is no canvas. */
export type Paint = (
  drawing: ReadDrawing,
  imageFor: ImageFor,
) => HTMLCanvasElement | undefined;

/**
 * Paint a drawing at life size onto a canvas of its own.
 *
 * Life size, because the stage draws through the map's own transform and a
 * picture at world resolution is what the game's texture is. The canvas is
 * the placement's size, so what is drawn past its edge is clipped exactly as
 * the engine clips it.
 */
export const paintLocal: Paint = (drawing, imageFor) => {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(drawing.width));
  canvas.height = Math.max(1, Math.round(drawing.height));
  const context = canvas.getContext('2d');
  if (!context) {
    return undefined;
  }
  paintDrawing(context, drawing.commands, imageFor);
  return canvas;
};

/**
 * Every picture the reader can give a map: one per kind that draws itself,
 * and one per placement of such a kind that overrides anything.
 *
 * `cache` is the caller's, keyed by placement key or kind, and is expected to
 * be replaced when the files, the images or the measure change — the reading
 * depends on all three and nothing else, so within one set of them a key
 * names one picture for good.
 */
export function localPictures(
  files: Files,
  doc: MapDoc,
  kinds: readonly string[],
  measure: Measure | undefined,
  imageFor: ImageFor,
  cache: Map<string, LocalPicture | null>,
  paint: Paint = paintLocal,
): LocalPictures {
  const out: LocalPictures = {pictures: {}, sizes: {}, complete: new Set()};
  const take = (
    key: string,
    type: string,
    overrides: Record<string, Record<string, unknown>>,
  ) => {
    let picture = cache.get(key);
    if (picture === undefined) {
      const drawing = readDrawing(files, type, overrides, measure);
      picture = drawing
        ? {
            canvas: paint(drawing, imageFor),
            size: {width: drawing.width, height: drawing.height},
            complete: drawing.complete,
          }
        : null;
      cache.set(key, picture);
    }
    if (!picture) {
      return;
    }
    if (picture.canvas) {
      out.pictures[key] = picture.canvas;
    }
    out.sizes[key] = picture.size;
    if (picture.complete) {
      out.complete.add(key);
    }
  };
  for (const kind of kinds) {
    take(kind, kind, {});
  }
  for (const actor of doc.actors) {
    const key = placementKey(actor.type, actor.properties);
    if (key) {
      take(key, actor.type, actor.properties ?? {});
    }
  }
  return out;
}

/** The appearance properties a drawing makes inert. */
const WORN = new Set<string>([
  APPEARANCE.sprite,
  APPEARANCE.spriteCellOrigin,
  APPEARANCE.spriteCellSize,
  APPEARANCE.animation,
]);

/**
 * The inspector's schemas, without the picture-wearing properties for a
 * kind that draws itself.
 *
 * A `define drawing` is the actor's picture; `set sprite` and `set
 * animation` on such an actor change nothing the player can see, and a field
 * that changes nothing is a field in the way. The group is dropped with them
 * when nothing else is in it.
 */
export function withoutWornPicture(
  schemas: Record<string, ActorSchema>,
  draws: (type: string) => boolean,
): Record<string, ActorSchema> {
  const out: Record<string, ActorSchema> = {};
  for (const [type, schema] of Object.entries(schemas)) {
    out[type] = draws(type)
      ? schema.flatMap(group => {
          if (group.trait !== APPEARANCE.trait) {
            return [group];
          }
          const props = group.props.filter(prop => !WORN.has(prop.propId));
          return props.length ? [{...group, props}] : [];
        })
      : schema;
  }
  return out;
}

/** Whether a kind draws itself, as the file says. */
export const drawsItself = (files: Files, type: string): boolean =>
  declaresDrawing(files, type);
