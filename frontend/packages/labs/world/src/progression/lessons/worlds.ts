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

export interface WorldSpec {
  name: string;
  /** Map size in TILES. A world with no `.map` file has no size until it says. */
  tiles: [x: number, y: number];
  /** What is placed in it, in order. */
  rows: object[];
}

/**
 * A `.world` file.
 *
 * `set size of map` is always written, and that is not padding: a world that
 * arranges its own actors has no bounds unless it says so, and a camera or a
 * boundary rule then clamps to the one screen it fits (AGENTS.md).
 */
export const worldFile = ({name, tiles, rows}: WorldSpec): string =>
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
                {
                  type: 'world_set_map_size',
                  inputs: {X: num(tiles[0]), Y: num(tiles[1])},
                },
                ...rows,
              ]),
            },
          },
        ],
      },
    },
    null,
    2,
  );
