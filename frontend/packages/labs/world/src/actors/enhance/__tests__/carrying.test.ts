// The moving platform, from both ends.
//
// `Carrying` is two traits on two actors: the platform `Carries` and its
// passenger `Rides`. Either end can be the one a learner is making, so each
// gets a row — and the interesting claims are about the pairing rather than
// about either trait. That a platform row writes into somebody else's file.
// That the passenger row is not offered where there is nothing to ride. And,
// because reading cannot tell whether the blocks make a thing move, that a
// player standing on a patrolling lift goes along with it.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {carriesEnhancement} from '../carries';
import {patrolsEnhancement} from '../patrols';
import {ridesEnhancement} from '../rides';

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

describe('carrying, from the platform', () => {
  const project = () => withActors('ground', 'coin');

  it('writes into the passenger as well as the platform', () => {
    // THE WHOLE REASON IT ASKS. A row that elected only `Carries` would leave
    // a platform behaving exactly as before — blocks written, nothing changed.
    const after = carriesEnhancement.apply(project(), GROUND, 'actors/coin');

    expect(at(after, 'actors/ground.actor')).toContain('Carrying#CarriesTrait');
    expect(at(after, 'actors/coin.actor')).toContain('Carrying#RidesTrait');
    expect(at(after, 'rules/carry.rule')).toBeTruthy();
  });

  it('offers every actor but the platform itself', () => {
    const offered = carriesEnhancement
      .asks!.options(project(), GROUND)
      .map(choice => choice.value);

    expect(offered).toContain('actors/coin');
    expect(offered).not.toContain('actors/ground');
  });

  it('does nothing without an answer', () => {
    const before = project();
    expect(carriesEnhancement.apply(before, GROUND)).toBe(before);
  });

  it('is not done until both ends wear their half', () => {
    // A platform that carries nobody is a row half done, and saying it was
    // done would leave it that way for good.
    const after = carriesEnhancement.apply(project(), GROUND, 'actors/coin');

    expect(carriesEnhancement.applied(after, GROUND, 'actors/coin')).toBe(true);
    expect(carriesEnhancement.applied(project(), GROUND, 'actors/coin')).toBe(
      false,
    );
  });

  it('does nothing the second time it is asked the same thing', () => {
    const once = carriesEnhancement.apply(project(), GROUND, 'actors/coin');
    expect(
      at(
        carriesEnhancement.apply(once, GROUND, 'actors/coin'),
        'actors/ground.actor',
      ),
    ).toBe(at(once, 'actors/ground.actor'));
  });
});

describe('carrying, from the passenger', () => {
  it('is not offered where there is nothing to ride', () => {
    // A trait that does nothing and says nothing about why is worse than a row
    // that is not on the shelf.
    expect(ridesEnhancement.offered!(withActors('coin'), COIN)).toBe(false);
  });

  it('is offered once the project holds a carrier', () => {
    const withLift = carriesEnhancement.apply(
      withActors('ground', 'coin'),
      GROUND,
      'actors/coin',
    );

    expect(ridesEnhancement.offered!(withLift, COIN)).toBe(true);
  });

  it('elects the one trait, and asks nothing', () => {
    const after = ridesEnhancement.apply(withActors('coin'), COIN);

    expect(ridesEnhancement.asks).toBeUndefined();
    expect(at(after, 'actors/coin.actor')).toContain('Carrying#RidesTrait');
    expect(at(after, 'actors/coin.actor')).not.toContain(
      'Carrying#CarriesTrait',
    );
  });

  it('does nothing the second time', () => {
    const once = ridesEnhancement.apply(withActors('coin'), COIN);
    expect(ridesEnhancement.applied(once, COIN)).toBe(true);
    expect(at(ridesEnhancement.apply(once, COIN), 'actors/coin.actor')).toBe(
      at(once, 'actors/coin.actor'),
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

const play = (world: World, seconds: number) => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.tick(1 / 60);
  }
};

const placedAt = (world: World, x: number, y: number) =>
  [...world.actors].find(
    actor =>
      actor.get(PositionProperty).x === x &&
      actor.get(PositionProperty).y === y,
  )!;

describe('the carrying rows, played', () => {
  it('takes a passenger along with the platform', async () => {
    // A lift that patrols, with a coin resting on it. Without `Rides` the coin
    // stays put and the lift slides out from under it — which is the bug the
    // rule exists for, and the reason the row writes into both files.
    let source = withActors('ground', 'coin');
    source = patrolsEnhancement.apply(source, GROUND);
    source = carriesEnhancement.apply(source, GROUND, 'actors/coin');

    const {world} = await compileProject(
      projectFiles(
        roomOf(source, [
          ['actors/ground', 160, 200],
          ['actors/coin', 160, 180],
        ]),
      ),
    );
    const lift = placedAt(world, 160, 200);
    const coin = placedAt(world, 160, 180);
    play(world, 1);

    expect(lift.get(PositionProperty).x).not.toBe(160);
    // The coin went where the lift went: not exactly, since it is resting
    // rather than welded, but in the same direction and not by nothing.
    expect(Math.abs(coin.get(PositionProperty).x - 160)).toBeGreaterThan(1);
  });
});
