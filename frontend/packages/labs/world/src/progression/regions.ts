// The map's regions: what they are called, where they sit, what color they are.
//
// Order matters twice over. The six FOUNDATIONS are listed in the order they
// sit clockwise on the map, starting north-east, and `catalogue.ts` places each
// one along the matching direction (`hex.CLOCKWISE`). The six GENRES follow in
// the same order, each in the wedge between the foundation of the same index
// and the next one round.

import type {Region, RegionId} from './types';

/** Where the hue wheel starts — Input, and everything else follows it. */
const FIRST_HUE = 145;
/** How far apart two neighbouring foundations are on the hue wheel. */
const HUE_STEP = 50;

const foundationHue = (index: number) => (FIRST_HUE + index * HUE_STEP) % 360;

/**
 * The foundations, clockwise from north-east.
 *
 * This order is the design (specs/PROGRESSION.md): each adjacent pair is the
 * pair of concepts a genre is made from, which is why Input sits beside Motion
 * (a platformer) and Memory beside Look (a story).
 */
export const FOUNDATIONS: readonly RegionId[] = [
  'input',
  'motion',
  'logic',
  'memory',
  'look',
  'place',
];

/** The genres, in the same order: genre `i` is between foundation `i` and `i+1`. */
export const GENRES: readonly RegionId[] = [
  'platformer',
  'arcade',
  'puzzle',
  'story',
  'adventure',
  'simulation',
];

const foundation = (id: RegionId, name: string, summary: string): Region => ({
  id,
  name,
  kind: 'foundation',
  summary,
  hue: foundationHue(FOUNDATIONS.indexOf(id)),
});

const genre = (id: RegionId, name: string, summary: string): Region => {
  const index = GENRES.indexOf(id);
  return {
    id,
    name,
    kind: 'genre',
    summary,
    between: [FOUNDATIONS[index], FOUNDATIONS[(index + 1) % 6]] as const,
  };
};

export const REGIONS: readonly Region[] = [
  {
    id: 'origin',
    name: 'Origin',
    kind: 'origin',
    summary: 'A world with something in it.',
    hue: 45,
  },

  foundation(
    'input',
    'Input',
    'How a player acts on the world: keys, the pointer, and the difference between holding one and pressing it.',
  ),
  foundation(
    'motion',
    'Motion',
    'How things move: a speed rather than a place, a force rather than a speed, and gravity.',
  ),
  foundation(
    'logic',
    'Logic',
    'Questions with two answers, and the questions the world answers for you — touching, and what a thing is.',
  ),
  foundation(
    'memory',
    'Memory',
    'State: a box for a number, state an actor carries, state the world shares, and all of them at once.',
  ),
  foundation(
    'look',
    'Look',
    'What a thing looks like: a picture, pictures in a row, a pen, a backdrop, and an effect.',
  ),
  foundation(
    'place',
    'Place',
    'Where things are: coordinates, a painted map, layers, and a camera on a world bigger than the screen.',
  ),

  genre(
    'platformer',
    'Platformer',
    'Gravity, a jump that feels right, something that can hurt you, and a level to cross.',
  ),
  genre(
    'arcade',
    'Arcade',
    'A ball off a wall, a paddle that cannot leave, bricks to clear, and bullets that clean up after themselves.',
  ),
  genre(
    'puzzle',
    'Puzzle',
    'A grid, crates that push, a win condition counted rather than declared, turns, and undo.',
  ),
  genre(
    'story',
    'Story',
    'Words on a screen, a line at reading pace, a script that branches, and a scene staged around it.',
  ),
  genre(
    'adventure',
    'Adventure',
    'A map bigger than the screen, rooms with doors between them, a door that needs a key, and an errand.',
  ),
  genre(
    'simulation',
    'Simulation',
    'A hundred of something, each chasing or fleeing, watching its neighbors — and dials to turn while it runs.',
  ),

  {
    id: 'making',
    name: 'Making',
    kind: 'making',
    summary:
      'Beyond every genre: stop using rules and write one. Read, change, extend, and finally define your own vocabulary.',
    hue: 0,
    // Six tiles, one past each genre's capstone, and no six-tile shape touches
    // all six of those places. See the field's own comment in ./types.
    scattered: true,
  },
];

const BY_ID = new Map(REGIONS.map(region => [region.id, region]));

export const region = (id: RegionId): Region => {
  const found = BY_ID.get(id);
  if (!found) {
    throw new Error(`no such region: ${id}`);
  }
  return found;
};

/**
 * The hue a region is drawn in.
 *
 * A foundation carries its own. A genre has none, and takes the midpoint of the
 * two foundations it lies between — going the short way round the wheel, which
 * is the way the map goes — so the color of the wedge says which two concepts
 * it was made from.
 */
export const regionHue = (id: RegionId): number => {
  const self = region(id);
  if (self.hue !== undefined) {
    return self.hue;
  }
  if (!self.between) {
    throw new Error(`region ${id} has neither a hue nor two to blend`);
  }
  const [first, second] = self.between;
  const a = regionHue(first);
  const b = regionHue(second);
  // Midpoint the short way: `b` may have wrapped past 360 since `a`.
  const delta = ((b - a + 540) % 360) - 180;
  return (a + delta / 2 + 360) % 360;
};
