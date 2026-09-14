// Switches and the walls they throw — as edits, and then as a game.
//
// The pair is teleport's shape again: two rows, one trait each, matched by a
// color both default to, and so nothing for either row to ask. What is worth
// running rather than reading is that the default really does pair them — a
// plate and a wall made by these two rows, with a learner setting nothing,
// have to actually work together, and the only way to know is to stand on one.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {isASwitchEnhancement, isASwitchedWallEnhancement} from '../switches';

const GROUND = {kind: 'actor' as const, path: 'actors/ground', name: 'Ground'};
const COIN = {kind: 'actor' as const, path: 'actors/coin', name: 'Coin'};

type Source = typeof WORLD_SCENARIOS.empty.source;

const withActors = (...ids: string[]): Source => {
  let source: Source = WORLD_SCENARIOS.empty.source;
  for (const id of ids) {
    source = importStockActor(source, stockActorById(id)!).source;
  }
  return source;
};

const at = (source: Source, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

const project = () => withActors('ground', 'player', 'coin');

describe('the two ends of a switch', () => {
  it('writes one trait each, and the rule they share', () => {
    const plate = isASwitchEnhancement.apply(project(), GROUND);
    expect(at(plate, 'actors/ground.actor')).toContain(
      'Switches#IsASwitchTrait',
    );
    expect(at(plate, 'rules/switches.rule')).toBeTruthy();

    const wall = isASwitchedWallEnhancement.apply(project(), COIN);
    expect(at(wall, 'actors/coin.actor')).toContain(
      'Switches#IsASwitchedWallTrait',
    );
    expect(at(wall, 'rules/switches.rule')).toBeTruthy();
  });

  it('asks nothing, and offers both ends from the start', () => {
    // A plate waiting for a wall is a plate waiting. Neither end is the one
    // you have to make first, so neither is gated on the other — which is the
    // difference from the teleport traveller, who has nowhere to go.
    for (const row of [isASwitchEnhancement, isASwitchedWallEnhancement]) {
      expect(row.asks).toBeUndefined();
      expect(row.offered).toBeUndefined();
    }
  });

  it('does nothing the second time, either end', () => {
    for (const [row, target, path] of [
      [isASwitchEnhancement, GROUND, 'actors/ground.actor'],
      [isASwitchedWallEnhancement, COIN, 'actors/coin.actor'],
    ] as const) {
      const once = row.apply(project(), target);
      expect(row.applied(once, target)).toBe(true);
      expect(at(row.apply(once, target), path)).toBe(at(once, path));
    }
  });
});

/** `add actor ⟨path⟩` at a place. */
const place = (path: string, x: number, y: number) => ({
  type: 'world_add_actor',
  fields: {ACTOR: path},
  inputs: {
    DO: {
      block: {
        type: 'world_set_position',
        inputs: {
          ACTOR: {block: {type: 'world_this_actor'}},
          X: {block: {type: 'math_number', fields: {NUM: x}}},
          Y: {block: {type: 'math_number', fields: {NUM: y}}},
        },
      },
    },
  },
});

const roomOf = (
  source: Source,
  placements: Array<[string, number, number]>,
): Source => {
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
  const rows = placements.map(([path, x, y]) => place(path, x, y));
  const chain = rows.reduceRight((next, row) => ({
    ...row,
    next: {block: next},
  }));
  return {
    ...source,
    files: {
      ...source.files,
      [world.id]: {
        ...world,
        contents: JSON.stringify({
          blocks: {
            blocks: [
              {
                type: 'world_world',
                x: 20,
                y: 20,
                fields: {NAME: 'My World'},
                next: {block: chain},
              },
            ],
          },
        }),
      },
    },
  };
};

const play = (world: World, seconds: number, keys: string[] = []) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys.map(keyName));
    world.tick(1 / 60);
  }
};

const placedAt = (world: World, x: number, y: number) =>
  [...world.actors].find(
    actor =>
      actor.get(PositionProperty).x === x &&
      actor.get(PositionProperty).y === y,
  )!;

describe('the switch rows, played', () => {
  /**
   * A plate, a wall of nobody's chosen color, and a player dropped on the
   * plate.
   *
   * THE FALL COMES FIRST, the same geometry every other played enhancement
   * test uses: placed a few pixels above a tile the player goes straight
   * through it, so it is a long drop and a second and a half of play.
   */
  const room = async (source: Source) => {
    const {world, modules} = await compileProject(
      projectFiles(
        roomOf(source, [
          ['actors/ground', 160, 300],
          ['actors/coin', 400, 300],
          ['actors/player', 160, 100],
        ]),
      ),
    );
    const passable = modules['rules/collisions']
      .PassesThroughThingsProperty as never;
    const wall = placedAt(world, 400, 300);
    return {world, wall, open: () => wall.get(passable) as boolean};
  };

  it('opens a wall when somebody walks onto the plate', async () => {
    // NOTHING SET ANYWHERE: both colors default to the same red, so this is
    // the pair a learner gets by ticking two boxes and placing two actors.
    let source = isASwitchEnhancement.apply(project(), GROUND);
    source = isASwitchedWallEnhancement.apply(source, COIN);
    const {world, open} = await room(source);

    expect(open()).toBe(false);
    play(world, 1.5);
    expect(open()).toBe(true);
  });

  it('leaves a wall alone when the plate is not a switch', async () => {
    // Which is what makes the claim above about the PLATE rather than about
    // a wall that opens on its own.
    const {world, open} = await room(
      isASwitchedWallEnhancement.apply(project(), COIN),
    );

    expect(open()).toBe(false);
    play(world, 1.5);
    expect(open()).toBe(false);
  });
});
