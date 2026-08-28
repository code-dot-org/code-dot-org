// The Blockly a lesson's world is written in.
//
// Small, repetitive shapes — a world with a size and some actors placed in it —
// which every lesson needs and none of them should spell out. The block types
// and socket names are not guessable and a wrong one fails quietly, so they are
// written once here and read from the fixtures that already prove them
// (`src/fixtures`, and AGENTS.md on dumping the palette before writing a
// block).

import {chain, me, num} from '../../actors/stock/workspace';

/** `set position of ⟨this actor⟩ x ⟨…⟩ y ⟨…⟩`, inside an `add actor`. */
export const placeAt = (x: number, y: number) => ({
  type: 'world_set_position',
  inputs: {ACTOR: me(), X: num(x), Y: num(y)},
});

/** `add actor ⟨actors/hero⟩ do ⟨…⟩`. */
export const addActor = (stem: string, body: object[]) => ({
  type: 'world_add_actor',
  fields: {ACTOR: `actors/${stem}`},
  ...(body.length ? {inputs: {DO: {block: chain(body)}}} : {}),
});

/**
 * `define ⟨type⟩ property ⟨name⟩ with default ⟨…⟩`.
 *
 * One block in four homes (`blockly/ownProperties`): at a rule's top level it
 * is the world's, inside a `define trait` it is the trait's, and chained under
 * a `define world` or a `define actor` it belongs to that file. The homes are
 * what these lessons are about, so they place it themselves.
 */
export const declareProperty = (
  type: 'number' | 'text' | 'boolean' | 'color' | 'vector' | 'actor',
  name: string,
  value: string,
) => ({
  type: 'world_rule_property',
  fields: {TYPE: type, ACCESS: 'writable', NAME: name, DEFAULT: value},
});

export interface WorldSpec {
  name: string;
  /**
   * Map size in TILES, for a world that wants one — and most do not.
   *
   * A world says nothing and gets one screen (`VIEWPORT_TILES`, ten tiles each
   * way, 320 by 320). That is the right answer for every lesson that has no
   * camera and no boundary rule, which is all the early ones: `set size of map`
   * matters when the world is BIGGER than the view, and putting it in a first
   * lesson is an advanced idea sitting in the way of a simple one.
   *
   * It was in all of them at first, out of a half-remembered warning
   * (AGENTS.md) about a world that arranges its own actors having no bounds. It
   * has bounds — the viewport's. What it lacks is bounds of its own, which only
   * something looking past the edge would notice.
   */
  tiles?: [x: number, y: number];
  /** What is placed in it, in order. */
  rows: object[];
  /**
   * Event handlers the world itself answers, each a ROOT of its own.
   *
   * A hat takes no previous connection, and `DisableOrphansPlugin` disables a
   * top-level block that has one along with everything below it — so a handler
   * sits beside the `define world` rather than in it, exactly as `actorFile`
   * places an actor's (specs/DRAWING.md).
   *
   * It also runs somewhere else, which is the part that matters when writing a
   * lesson: a `define world` body is handed a BUILDER, and a handler is handed
   * the world. A rule's action — `world.act(…)` — is a line only the second can
   * run, so a lesson that wants one wants a handler.
   */
  handlers?: object[];
}

/** A `.world` file. */
export const worldFile = ({name, tiles, rows, handlers}: WorldSpec): string =>
  JSON.stringify(
    {
      blocks: {
        blocks: [
          {
            type: 'world_world',
            x: 20,
            y: 20,
            fields: {NAME: name},
            next: {
              block: chain([
                ...(tiles
                  ? [
                      {
                        type: 'world_set_map_size',
                        inputs: {X: num(tiles[0]), Y: num(tiles[1])},
                      },
                    ]
                  : []),
                ...rows,
              ]),
            },
          },
          ...(handlers ?? []).map((handler, index) => ({
            ...handler,
            x: 340,
            y: 20 + index * 160,
          })),
        ],
      },
    },
    null,
    2,
  );
