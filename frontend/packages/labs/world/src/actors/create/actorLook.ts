// What an actor LOOKS like, as the one row that says so.
//
// An actor shows either a still picture or an animation, and each is one row in
// its `define actor` chain: `set sprite ⟨coin.png⟩` or
// `play animation ⟨coinSpin⟩`. Neither is a row every actor has — an interface
// actor paints itself and must not carry a picture over the top
// (specs/UI_ACTORS.md) — so "no look" is a real answer rather than a missing
// one.
//
// THE WIZARD BOTH READS AND WRITES IT. A copied Crawler arrives at the picture
// step already looking like something, so the step opens on that answer rather
// than on an empty grid; changing it has to REPLACE the row rather than append
// a second, because two rows both saying what an actor looks like is a file
// where the last one silently wins.
//
// A pure transform over a workspace's JSON, like `enhance/patch`: the wizard
// builds its actor in a draft source and commits once, so nothing here knows
// about the project or about React.

import {down, rootsOf, type BlockJson} from '../enhance/patch';

const SPRITE_ROW = 'world_set_sprite';
const ANIMATION_ROW = 'world_play_animation';
const SCALE_ROW = 'world_set_Space_ScaleProperty';

/** What an actor is drawn as. */
export type ActorLook =
  | {kind: 'sprite'; value: string}
  | {kind: 'animation'; value: string};

/** Whether a row is one of the two that says what an actor looks like. */
const isLook = (block: BlockJson): boolean =>
  block.type === SPRITE_ROW || block.type === ANIMATION_ROW;

/** The look a workspace's `define actor` already declares, if it declares one. */
export function lookOf(contents: string): ActorLook | undefined {
  for (const root of rootsOf(contents)) {
    if (root.type !== 'world_actor') {
      continue;
    }
    for (const row of down(root)) {
      if (row.type === SPRITE_ROW) {
        return {kind: 'sprite', value: String(row.fields?.SPRITE ?? '')};
      }
      if (row.type === ANIMATION_ROW) {
        return {kind: 'animation', value: String(row.fields?.ANIMATION ?? '')};
      }
    }
  }
  return undefined;
}

/** The row a look is written as. */
const rowFor = (look: ActorLook): BlockJson =>
  look.kind === 'sprite'
    ? {type: SPRITE_ROW, fields: {SPRITE: look.value}}
    : {type: ANIMATION_ROW, fields: {ANIMATION: look.value}};

/**
 * Make the actor look like this, replacing whatever it looked like.
 *
 * IN PLACE where there is a row already, and appended where there is not. In
 * place matters twice: a second row is a file whose two answers disagree, and
 * an actor that had its picture at the top of its chain should not find it
 * moved to the bottom for having been changed.
 *
 * Returns the contents unchanged when the file has no `define actor` — a
 * workspace with its definition deleted is a project that does not compile,
 * and this is not the thing to notice it (`enhance/patch.append` says the
 * same).
 */
export function withLook(contents: string, look: ActorLook): string {
  const workspace = JSON.parse(contents || '{}') as {
    blocks?: {blocks?: BlockJson[]};
  };
  const root = (workspace.blocks?.blocks ?? []).find(
    one => one.type === 'world_actor',
  );
  if (!root) {
    return contents;
  }
  const row = rowFor(look);
  for (const at of down(root)) {
    const next = at.next?.block;
    if (next && isLook(next)) {
      at.next = {block: {...row, ...(next.next ? {next: next.next} : {})}};
      return JSON.stringify(workspace, null, 2);
    }
  }
  // Nothing to replace: on the end of the chain, which is where every other
  // row an assistant writes goes (`enhance/patch` says why).
  let last = root;
  for (const at of down(root)) {
    last = at;
  }
  last.next = {block: row};
  return JSON.stringify(workspace, null, 2);
}

/**
 * Make the actor fill this many tiles, as a row in its own file.
 *
 * ONE TILE WRITES NOTHING. Every actor is one tile by default — that is what
 * fitting a picture to a tile made the unit (specs/ACTOR_SIZE.md) — so a row
 * saying "scale 1 by 1" is a row saying nothing, and a file that opens with
 * one explains something nobody did.
 *
 * Appended, and only once: the learner may change the shape and come back, and
 * two rows setting the scale is a file whose second answer silently wins. The
 * reasoning is `withLook`'s, one property along.
 */
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

export function withScale(
  contents: string,
  shape: {x: number; y: number},
  drawn?: {width?: number; height?: number},
): string {
  if (shape.x === 1 && shape.y === 1) {
    return contents;
  }
  const scale = scaleFor(shape, drawn);
  const workspace = JSON.parse(contents || '{}') as {
    blocks?: {blocks?: BlockJson[]};
  };
  const root = (workspace.blocks?.blocks ?? []).find(
    one => one.type === 'world_actor',
  );
  if (!root) {
    return contents;
  }
  const row: BlockJson = {
    type: SCALE_ROW,
    inputs: {
      ACTOR: {block: {type: 'world_this_actor'}},
      X: {block: {type: 'math_number', fields: {NUM: scale.x}}},
      Y: {block: {type: 'math_number', fields: {NUM: scale.y}}},
    },
  };
  for (const at of down(root)) {
    const next = at.next?.block;
    if (next?.type === SCALE_ROW) {
      at.next = {block: {...row, ...(next.next ? {next: next.next} : {})}};
      return JSON.stringify(workspace, null, 2);
    }
  }
  let last = root;
  for (const at of down(root)) {
    last = at;
  }
  last.next = {block: row};
  return JSON.stringify(workspace, null, 2);
}
