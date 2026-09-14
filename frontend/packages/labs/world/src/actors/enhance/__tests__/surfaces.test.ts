// Floors that do something to you — as edits, and then as a game.
//
// Three kinds of floor and one walker, which is the same two-ended shape the
// moving platform has: the floor is what is special and the walker is what
// notices, and a row that wrote only the first would change nothing anybody
// could see. What is new here is that the three REFUSE each other — a tile
// takes one of them, or none and stays an ordinary floor.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {
  conveysEnhancement,
  slipperyEnhancement,
  slowsEnhancement,
  walksOnSurfacesEnhancement,
} from '../surfaces';

const GROUND = {kind: 'actor' as const, path: 'actors/ground', name: 'Ground'};
const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

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

const project = () => withActors('ground', 'player');

describe('floors that do something', () => {
  it('writes the floor its kind and the walker its noticing', () => {
    const after = slipperyEnhancement.apply(project(), GROUND, 'actors/player');

    expect(at(after, 'actors/ground.actor')).toContain(
      'Surfaces#SlipperyTrait',
    );
    expect(at(after, 'actors/player.actor')).toContain(
      'Surfaces#StandsOnSurfacesTrait',
    );
    expect(at(after, 'rules/surfaces.rule')).toBeTruthy();
  });

  it('refuses a floor that is already another kind, and says which', () => {
    // A tile takes ONE of the three. Two would be two rules arguing over the
    // same walker every frame.
    const icy = slipperyEnhancement.apply(project(), GROUND, 'actors/player');

    expect(conveysEnhancement.refuse!(icy, GROUND)).toMatch(/already slippery/);
    expect(slowsEnhancement.refuse!(icy, GROUND)).toMatch(/already slippery/);
    // …and the one it IS is not refused: that row reads as already done.
    expect(slipperyEnhancement.refuse!(icy, GROUND)).toBeUndefined();
  });

  it('refuses nothing on an ordinary floor', () => {
    for (const row of [
      slipperyEnhancement,
      conveysEnhancement,
      slowsEnhancement,
    ]) {
      expect(row.refuse!(project(), GROUND)).toBeUndefined();
    }
  });

  it('is not done until the walker notices', () => {
    const after = conveysEnhancement.apply(project(), GROUND, 'actors/player');

    expect(conveysEnhancement.applied(after, GROUND, 'actors/player')).toBe(
      true,
    );
    expect(conveysEnhancement.applied(project(), GROUND, 'actors/player')).toBe(
      false,
    );
  });

  it('does nothing without an answer', () => {
    const before = project();
    expect(slowsEnhancement.apply(before, GROUND)).toBe(before);
  });
});

describe('noticing them, from the walker', () => {
  it('is not offered where every floor is an ordinary one', () => {
    expect(walksOnSurfacesEnhancement.offered!(project(), PLAYER)).toBe(false);
  });

  it('is offered once some floor is special', () => {
    const icy = slipperyEnhancement.apply(project(), GROUND, 'actors/player');

    expect(walksOnSurfacesEnhancement.offered!(icy, PLAYER)).toBe(true);
  });

  it('elects the one trait, and asks nothing', () => {
    const after = walksOnSurfacesEnhancement.apply(project(), PLAYER);

    expect(walksOnSurfacesEnhancement.asks).toBeUndefined();
    expect(at(after, 'actors/player.actor')).toContain(
      'Surfaces#StandsOnSurfacesTrait',
    );
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

describe('the surface rows, played', () => {
  /**
   * A player on a floor, having already landed on it.
   *
   * THE FALL COMES FIRST. Placed a few pixels above the floor the player goes
   * straight through it — the first cut of this put it forty pixels up and
   * measured a player at y 482, still falling. The geometry the other
   * enhancement tests use is a long drop onto one tile, and a second of play
   * to be standing before anything is asked of it.
   */
  const landed = async (source: Source) => {
    const {world} = await compileProject(
      projectFiles(
        roomOf(source, [
          ['actors/ground', 160, 300],
          ['actors/player', 160, 100],
        ]),
      ),
    );
    const player = placedAt(world, 160, 100);
    play(world, 1.5);
    return {world, player};
  };

  it('carries a player along a belt that it is only standing on', async () => {
    // THE CONVEYOR RATHER THAN THE ICE, and the reason is worth keeping. Ice
    // is "keep the speed you arrived with" (`rules/stock/surfaces`), so a
    // player that lands stationary on it has nothing to keep — showing it off
    // needs a run-up across ordinary floor and onto ice, which is two floor
    // KINDS, and a row makes a kind slippery rather than a tile. A belt asks
    // nothing of the walker at all, so it is the one a room this size can
    // show.
    //
    // TWO ROOMS OVER THE SAME PLAY, rather than one room measured twice. The
    // belt starts working the moment the player lands and carries it off the
    // single tile it is standing on, so "where is it now" depends on exactly
    // when it is asked; "further along than the same player on stone" does
    // not.
    const onBelt = await landed(
      conveysEnhancement.apply(project(), GROUND, 'actors/player'),
    );
    const onStone = await landed(
      walksOnSurfacesEnhancement.apply(project(), PLAYER),
    );

    expect(onBelt.player.get(PositionProperty).x).toBeGreaterThan(
      onStone.player.get(PositionProperty).x,
    );
  });

  it('leaves an ordinary floor alone', async () => {
    // Which is what makes the claim above about the BELT rather than about
    // a player that wanders.
    const {player} = await landed(
      walksOnSurfacesEnhancement.apply(project(), PLAYER),
    );

    expect(player.get(PositionProperty).x).toBe(160);
  });
});
