// What an actor LOOKS like, and how big it is drawn: the wizard both reads and
// writes them. A copied Crawler arrives at the picture step already looking
// like something, so the step opens on that answer rather than on an empty
// grid. Neither is something every actor has — an interface actor paints
// itself and must not carry a picture over the top (specs/UI_ACTORS.md) — so
// "no look" is a real answer rather than a missing one.
//
// A pure transform over an actor's data (`actors/actorData`): the wizard
// builds its actor in a draft source and commits once, so nothing here knows
// about the project or about React.

import {
  isActorData,
  lookOf as dataLookOf,
  withLookOf,
  withMainAnimation,
  type ActorData,
} from '../actorData';
import {withValue} from '../enhance/patch';
import {stockAnimations} from '../stock/workspace';

const SCALE_SETTER = 'world_set_Space_ScaleProperty';

/** What an actor is drawn as. */
export type ActorLook =
  | {kind: 'sprite'; value: string}
  | {kind: 'animation'; value: string};

/** The data a file holds, or nothing for a file that is not an actor. */
const dataOf = (contents: string): ActorData | undefined => {
  try {
    const held = JSON.parse(contents) as unknown;
    return isActorData(held) ? held : undefined;
  } catch {
    return undefined;
  }
};

/** The file with its data changed, or as it was when it holds none. */
const changed = (
  contents: string,
  change: (data: ActorData) => ActorData,
): string => {
  const data = dataOf(contents);
  return data ? JSON.stringify(change(data), null, 2) : contents;
};

/**
 * The look an actor already has: its Main's picture, or the first one an
 * animated Main shows (specs/ANIMATION_PLAN.md).
 */
export function lookOf(contents: string): ActorLook | undefined {
  const data = dataOf(contents);
  const look = data && dataLookOf(data);
  return look ? {kind: 'sprite', value: look.sprite} : undefined;
}

/**
 * Make the actor look like this, replacing whatever it looked like: a
 * picture is a still Main, and an animation from the library is its Main.
 */
export const withLook = (contents: string, look: ActorLook): string =>
  changed(contents, data =>
    look.kind === 'sprite'
      ? withLookOf(data, {sprite: look.value})
      : withMainAnimation(data, stockAnimations({Main: look.value}).Main),
  );

/**
 * The scale that makes a picture fill the tiles it was asked to fill.
 *
 * (X, Y) IS THE RIGHT PAIR ONLY FOR A SQUARE PICTURE, which is what this used
 * to write for every one. `intrinsic size` is the picture fitted so its
 * LONGEST side is one tile, with its proportions kept, and what is drawn is
 * that times the scale — so for a picture W by H:
 *
 *     drawn.x = W · (tile / max(W, H)) · scale.x
 *
 * and asking for that to be `tile · x` gives `scale.x = x · max(W, H) / W`,
 * which is `x` exactly when W equals H.
 *
 * IT WAS REPORTED AS GAPS. An actor asked to fill one tile across and two up
 * was drawn from a 1024 by 1536 picture — the nearest shape a provider offers
 * to 1:2 is 2:3 — so its intrinsic size was 21 by 32, scaling by (1, 2) drew
 * it 21 wide, and a row of them on a 32-pixel grid stood ten pixels apart. No
 * trimming was involved; the arithmetic had never been right for a picture
 * that was not square.
 *
 * Without a measurement this falls back to what it did before. A picture
 * chosen from the project's own grid is art the learner picked rather than art
 * composed to this shape, and stretching it to fill the box is not obviously
 * what they meant.
 */
const scaleFor = (
  shape: {x: number; y: number},
  drawn?: {width?: number; height?: number},
): {x: number; y: number} => {
  const width = drawn?.width ?? 0;
  const height = drawn?.height ?? 0;
  if (width <= 0 || height <= 0) {
    return shape;
  }
  const longest = Math.max(width, height);
  /** Two places, so the block reads as a number rather than as a computation. */
  const tidy = (value: number) => Math.round(value * 100) / 100;
  return {
    x: tidy((shape.x * longest) / width),
    y: tidy((shape.y * longest) / height),
  };
};

/**
 * Make the actor fill this many tiles, replacing the scale it had.
 *
 * ONE TILE WRITES NOTHING. Every actor is one tile by default — that is what
 * fitting a picture to a tile made the unit (specs/ACTOR_SIZE.md) — so a
 * value saying "scale 1 by 1" says nothing, and an actor that opens with one
 * explains something nobody did.
 */
export const withScale = (
  contents: string,
  shape: {x: number; y: number},
  drawn?: {width?: number; height?: number},
): string =>
  shape.x === 1 && shape.y === 1
    ? contents
    : changed(contents, data =>
        withValue(data, {
          setter: SCALE_SETTER,
          type: 'vector',
          value: scaleFor(shape, drawn),
        }),
      );
