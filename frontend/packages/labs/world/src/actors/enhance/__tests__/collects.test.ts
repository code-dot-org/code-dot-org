// Collecting, and scoring for it — as edits, and then as a game.
//
// The pair the starter is made of, and the half that cannot be checked by
// reading: a trait that lets an actor take a coin, and a handler that says
// what taking one is worth. Neither does anything without the other, and
// nothing says so.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {collectsEnhancement} from '../collects';

const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};

/** The empty scenario with a Player, a Ground and a Coin in it. */
const withActors = () => {
  let source = WORLD_SCENARIOS.empty.source;
  for (const id of ['player', 'ground', 'coin']) {
    source = importStockActor(source, stockActorById(id)!).source;
  }
  return source;
};

const at = (source: ReturnType<typeof withActors>, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

describe('the collects enhancement, as edits', () => {
  it('gives the actor the trait and the handler that pays for it', () => {
    const after = collectsEnhancement.apply(withActors(), PLAYER);
    const actor = at(after, 'actors/player.actor')!;

    expect(actor).toContain('Collection#CollectsTrait');
    expect(actor).toContain('world_on_Collection_CollectsEvent');
    expect(actor).toContain('world_do_Scoring_AddToTheScoreAction');
    // Both rules, because neither half works alone.
    expect(at(after, 'rules/collect.rule')).toBeTruthy();
    expect(at(after, 'rules/score.rule')).toBeTruthy();
  });

  it('does nothing the second time', () => {
    const once = collectsEnhancement.apply(withActors(), PLAYER);
    expect(collectsEnhancement.applied(once, PLAYER)).toBe(true);

    expect(
      at(collectsEnhancement.apply(once, PLAYER), 'actors/player.actor'),
    ).toBe(at(once, 'actors/player.actor'));
  });
});

describe('the collects enhancement, played', () => {
  /** `add actor ⟨path⟩` at a place, as a world says it. */
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

  /** The enhanced project, with a player standing on a coin. */
  const played = () => {
    const source = collectsEnhancement.apply(withActors(), PLAYER);
    const worldId = fileIdAt(source, 'worlds/main.world')!;
    const parsed = JSON.parse(source.files[worldId].contents);
    const root = parsed.blocks.blocks.find(
      (block: {type: string}) => block.type === 'world_world',
    );
    // The coin where the player is, so the two touch on the first frame.
    // Chained IN FRONT of whatever the enhancements appended, rather than over
    // it: the scoreboard's layer is a row in this same chain.
    root.next = {
      block: {
        ...place('actors/ground', 100, 200),
        next: {
          block: {
            ...place('actors/coin', 100, 100),
            next: {
              block: {...place('actors/player', 100, 100), next: root.next},
            },
          },
        },
      },
    };
    return {
      ...source,
      files: {
        ...source.files,
        [worldId]: {
          ...source.files[worldId],
          contents: JSON.stringify(parsed),
        },
      },
    };
  };

  it('takes the coin, and the score goes up by ten', async () => {
    const {world, modules} = await compileProject(projectFiles(played()));
    const scoring = modules['rules/score'] as unknown as {
      ScoreProperty: never;
    };
    const collection = modules['rules/collect'] as unknown as {
      CollectsTrait: never;
      CanBeCollectedTrait: never;
    };
    const actors = [...world.actors];
    const player = actors.find(actor => actor.has(collection.CollectsTrait))!;
    const coin = actors.find(actor =>
      actor.has(collection.CanBeCollectedTrait),
    )!;

    expect(world.get(scoring.ScoreProperty)).toBe(0);
    expect(coin.get(PositionProperty)).toBeTruthy();

    // Two ticks: one for the collision to be noticed and the coin taken, one
    // for the handler the enhancement wrote to be dispatched.
    world.tick(1 / 60);
    world.tick(1 / 60);

    expect(world.get(scoring.ScoreProperty)).toBe(10);
    expect([...world.actors]).not.toContain(coin);
    expect(player.get(PositionProperty)).toBeTruthy();
  }, 60000);
});
