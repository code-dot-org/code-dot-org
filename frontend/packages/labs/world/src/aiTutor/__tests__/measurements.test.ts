// What the tutor is told about size.
//
// The tutor kept asking the student how big their map was and what size their
// tiles were — questions the lab can answer without being asked, and which a
// model left to guess answers with 16, because that is the tile size of most of
// the games it has read. A wall placed on a 16-pixel grid in a 32-pixel world
// is half a tile out of true, everywhere, and looks like the student's mistake.

import {describe, expect, it} from 'vitest';

import {TILE_SIZE, VIEWPORT_TILES} from '../../runtime/viewport';
import {declaredMapSize, mapSizeOf, worldMeasurements} from '../measurements';

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

describe('declaredMapSize', () => {
  it('reads a size the world sets, however deep the block sits', () => {
    expect(declaredMapSize(sized(20, 12))).toEqual({
      columns: 20,
      rows: 12,
      declared: true,
    });
  });

  it('is undefined when the world sets none', () => {
    expect(declaredMapSize(bare)).toBeUndefined();
  });

  it('is undefined when the size is computed rather than typed', () => {
    // A size that is an expression is a size this cannot state, and saying
    // nothing is better than saying something wrong.
    const computed = JSON.stringify({
      blocks: {
        blocks: [
          {
            type: 'world_set_map_size',
            inputs: {
              X: {block: {type: 'math_arithmetic'}},
              Y: {block: {type: 'math_number', fields: {NUM: 10}}},
            },
          },
        ],
      },
    });

    expect(declaredMapSize(computed)).toBeUndefined();
  });

  it('says nothing about a world that does not parse', () => {
    expect(declaredMapSize('not json')).toBeUndefined();
  });

  it('clamps to what the editor would clamp to', () => {
    expect(declaredMapSize(sized(999, 0.4))?.columns).toBe(64);
    expect(declaredMapSize(sized(999, 0.4))?.rows).toBe(1);
  });
});

describe('mapSizeOf', () => {
  it('falls back to one screen, which is what the editor draws', () => {
    expect(mapSizeOf(bare)).toEqual({
      columns: VIEWPORT_TILES,
      rows: VIEWPORT_TILES,
      declared: false,
    });
  });
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

  it('explains that a position is a centre, in pixels', () => {
    const said = worldMeasurements({'main.world': bare})!;

    // The conversion the model has to do to place anything on the grid.
    expect(said).toContain('CENTRE');
    expect(said).toContain(`n * ${TILE_SIZE} + ${TILE_SIZE / 2}`);
    expect(said).toContain('Y grows DOWNWARD');
  });

  it('is nothing at all when the project holds no world', () => {
    expect(worldMeasurements({})).toBeUndefined();
  });
});
