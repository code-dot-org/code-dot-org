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

/** A Main Screen or a map, at a size it states, or at none. */
const sized = (columns?: number, rows?: number) =>
  JSON.stringify({
    type: 'map',
    actors: [],
    ...(columns && rows ? {size: {width: columns, height: rows}} : {}),
  });

const bare = sized();

describe('worldMeasurements', () => {
  it('states the tile size, which is the question that was being asked', () => {
    const said = worldMeasurements({'screens/main.screen': bare})!;

    expect(said).toContain(`One tile is ${TILE_SIZE} pixels square`);
    expect(said).toContain('Do not assume any other tile size');
  });

  it('says a map takes the default, rather than leaving it unsaid', () => {
    // The difference that matters: "it is 10 x 10" invites the model to
    // resize the map when nothing asked it to.
    const said = worldMeasurements({'maps/main.map': bare})!;

    expect(said).toContain('says no size');
    expect(said).toContain('10 x 10 tiles');
  });

  it('reports each map separately, because they need not agree', () => {
    const said = worldMeasurements({
      'maps/main.map': bare,
      'maps/big.map': sized(30, 20),
    })!;

    expect(said).toContain('`maps/main.map` says no size');
    expect(said).toContain('`maps/big.map` is 30 x 20 tiles');
    expect(said).toContain('960 x 640 pixels');
  });

  it('explains that a position is a center, in pixels', () => {
    const said = worldMeasurements({'screens/main.screen': bare})!;

    // The conversion the model has to do to place anything on the grid.
    expect(said).toContain('CENTRE');
    expect(said).toContain(`n * ${TILE_SIZE} + ${TILE_SIZE / 2}`);
    expect(said).toContain('Y grows DOWNWARD');
  });

  it('is nothing at all when the project holds no screen and no map', () => {
    expect(worldMeasurements({})).toBeUndefined();
  });

  it('states the window the Main Screen gives the game, in tiles and pixels', () => {
    // A room-sized level — 26 by 16, all of it visible — is the case the
    // standard window cannot express, and a tutor told "the screen is 10 x 10"
    // about one would place every block it suggests off the right-hand edge.
    const said = worldMeasurements({'screens/main.screen': sized(26, 16)});

    expect(said).toContain('26 x 16 tiles (832 x 512 pixels)');
  });

  it('gives the standard window for a screen that states none', () => {
    const said = worldMeasurements({'screens/main.screen': bare});

    expect(said).toContain('since it says no other');
  });
});
