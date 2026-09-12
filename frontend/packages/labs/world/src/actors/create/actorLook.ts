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
