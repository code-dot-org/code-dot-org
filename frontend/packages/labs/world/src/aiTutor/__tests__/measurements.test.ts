// What the tutor is told about size.
//
// The tutor kept asking the student how big their map was and what size their
// tiles were — questions the lab can answer without being asked, and which a
// model left to guess answers with 16, because that is the tile size of most of
// the games it has read. A wall placed on a 16-pixel grid in a 32-pixel world
// is half a tile out of true, everywhere, and looks like the student's mistake.

import {describe, expect, it} from 'vitest';

import {TILE_SIZE} from '../../runtime/viewport';
import {worldMeasurements} from '../measurements';

/** A world workspace that sets its own size. */
const sized = (columns: number, rows: number) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_set_map_size',
              inputs: {
                X: {block: {type: 'math_number', fields: {NUM: columns}}},
                Y: {block: {type: 'math_number', fields: {NUM: rows}}},
              },
            },
          },
        },
      ],
    },
  });

const bare = JSON.stringify({
  blocks: {blocks: [{type: 'world_world', fields: {NAME: 'My World'}}]},
});

const seeing = (columns: number, rows: number) =>
  JSON.stringify({
    blocks: {
      blocks: [
        {
          type: 'world_world',
          fields: {NAME: 'My World'},
          next: {
            block: {
              type: 'world_set_view_size',
              inputs: {
                X: {block: {type: 'math_number', fields: {NUM: columns}}},
                Y: {block: {type: 'math_number', fields: {NUM: rows}}},
              },
            },
          },
        },
      ],
    },
  });

describe('worldMeasurements', () => {
  it('states the tile size, which is the question that was being asked', () => {
    const said = worldMeasurements({'main.world': bare})!;

    expect(said).toContain(`One tile is ${TILE_SIZE} pixels square`);
    expect(said).toContain('Do not assume any other tile size');
  });

  it('says a world takes the default, rather than leaving it unsaid', () => {
    // The difference that matters: "it is 10 x 10" invites the model to write
    // `set size of map` when nothing asked it to.
    const said = worldMeasurements({'main.world': bare})!;

    expect(said).toContain('does not set a size');
    expect(said).toContain('10 x 10 tiles');
  });

  it('reports each world separately, because they need not agree', () => {
    const said = worldMeasurements({
      'main.world': bare,
      'big.world': sized(30, 20),
    })!;

    expect(said).toContain('`main.world` does not set a size');
    expect(said).toContain('`big.world` is 30 x 20 tiles');
    expect(said).toContain('960 x 640 pixels');
  });

  it('explains that a position is a center, in pixels', () => {
    const said = worldMeasurements({'main.world': bare})!;

    // The conversion the model has to do to place anything on the grid.
    expect(said).toContain('CENTRE');
    expect(said).toContain(`n * ${TILE_SIZE} + ${TILE_SIZE / 2}`);
    expect(said).toContain('Y grows DOWNWARD');
  });

  it('is nothing at all when the project holds no world', () => {
    expect(worldMeasurements({})).toBeUndefined();
  });

  it('states a view a world sets, in tiles and pixels', () => {
    // A room-sized level — 26 by 16, all of it visible — is the case the
    // standard window cannot express, and a tutor told "the screen is 10 x 10"
    // about one would place every block it suggests off the right-hand edge.
    const said = worldMeasurements({'worlds/room.world': seeing(26, 16)});

    expect(said).toContain('26 x 16 tiles (832 x 512 pixels)');
    expect(said).toContain('set size of view to');
  });

  it('says nothing per world about a view nobody set', () => {
    // The paragraph above already gives the default. Repeating it under every
    // world is boilerplate the tutor pays for by the token.
    const said = worldMeasurements({'worlds/main.world': sized(20, 12)});

    expect(said).not.toContain('at once, which it sets');
  });
});
