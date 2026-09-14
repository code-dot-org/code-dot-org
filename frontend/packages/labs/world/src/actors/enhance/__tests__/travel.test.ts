// Five rows that stand on their own — as edits, and then as games.
//
// What they share is that none of them needs a companion and none asks a
// question: an actor wraps by itself, expires by itself, drives by itself.
// That makes them the shortest rows on the shelf and the easiest to get
// subtly wrong, since there is nothing to notice when a trait does nothing.
// So each is played.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {drivesEnhancement} from '../drives';
import {expiresEnhancement} from '../expires';
import {jetpackEnhancement} from '../jetpack';
import {topDownControlsEnhancement} from '../topDownControls';
import {wrapsAcrossEnhancement, wrapsDownEnhancement} from '../wraps';

const COIN = {kind: 'actor' as const, path: 'actors/coin', name: 'Coin'};

type Source = typeof WORLD_SCENARIOS.empty.source;

const withCoin = (): Source =>
  importStockActor(WORLD_SCENARIOS.empty.source, stockActorById('coin')!)
    .source;

const at = (source: Source, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

describe('what each row writes', () => {
  it.each([
    [
      'wraps-across',
      wrapsAcrossEnhancement,
      'Screen Wrap#WrapsAcrossTrait',
      'rules/wrap.rule',
    ],
    [
      'wraps-down',
      wrapsDownEnhancement,
      'Screen Wrap#WrapsDownTrait',
      'rules/wrap.rule',
    ],
    [
      'expires',
      expiresEnhancement,
      'Expiry#ExpiresTrait',
      'rules/expires.rule',
    ],
    [
      'drives',
      drivesEnhancement,
      'Arrow Drive#DrivenByArrowKeysTrait',
      'rules/drive.rule',
    ],
    [
      'jetpack',
      jetpackEnhancement,
      'Jetpack#FliesWithAJetpackTrait',
      'rules/jetpack.rule',
    ],
  ])('%s elects its trait and brings its rule', (_id, row, trait, rule) => {
    const after = row.apply(withCoin(), COIN);

    expect(at(after, 'actors/coin.actor')).toContain(trait);
    expect(at(after, rule)).toBeTruthy();
    expect(row.applied(after, COIN)).toBe(true);
    // …and asks nothing, which is what makes these the short rows.
    expect(row.asks).toBeUndefined();
  });

  it('wraps one way without wrapping the other', () => {
    // A side-scroller broken by wrapping down: step off a ledge and reappear
    // in the sky. Wanting one is not wanting the other.
    const across = at(
      wrapsAcrossEnhancement.apply(withCoin(), COIN),
      'actors/coin.actor',
    )!;

    expect(across).not.toContain('WrapsDownTrait');
  });

  it('gives a jetpack the handlers flight is made of', () => {
    // THE TRAIT ALONE DOES NOTHING, which a played test found and reading
    // would not have: flight is held down, so it is a press and a release
    // rather than a step that watches a key.
    const flying = at(
      jetpackEnhancement.apply(withCoin(), COIN),
      'actors/coin.actor',
    )!;

    expect(flying).toContain('world_do_Jetpack_StartFlyingAction');
    expect(flying).toContain('world_do_Jetpack_StopFlyingAction');
    expect(flying).toContain('world_on_Input_ReleasesEvent');
  });

  it('gives a jetpack its gravity too', () => {
    // A jetpack is a way of resisting a fall, and an actor that was never
    // falling has nothing to resist. Left out, the learner gets a flight key
    // that does nothing until they find the falling row.
    const flying = at(
      jetpackEnhancement.apply(withCoin(), COIN),
      'actors/coin.actor',
    )!;

    expect(flying).toContain('Gravity#AffectedByGravityTrait');
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

describe('the standalone rows, played', () => {
  const roomWith = async (source: Source, x = 160, y = 160) => {
    const {world} = await compileProject(
      projectFiles(roomOf(source, [['actors/coin', x, y]])),
    );
    return {world, coin: [...world.actors][0]};
  };

  it('turns and thrusts rather than walking, when it drives', async () => {
    // The whole difference from the other two movement rows: right TURNS.
    // Held alone it changes where the actor points and not where it is.
    const {world, coin} = await roomWith(
      drivesEnhancement.apply(withCoin(), COIN),
    );
    play(world, 0.4, ['ArrowRight']);
    const turned = coin.get(PositionProperty);

    expect(turned.x).toBeCloseTo(160, 0);

    // …and then a push sends it somewhere, which is the other half.
    play(world, 0.4, ['ArrowUp']);
    expect(coin.get(PositionProperty)).not.toEqual(turned);
  });

  it('takes an expiring actor out of the world', async () => {
    const {world} = await roomWith(expiresEnhancement.apply(withCoin(), COIN));
    expect([...world.actors]).toHaveLength(1);

    // Longer than any sensible default lifetime, and the claim is only that
    // it goes — how long it gets is a block in the actor's file.
    play(world, 12);

    expect([...world.actors]).toHaveLength(0);
  });

  it('carries an actor off one edge and in at the other', async () => {
    // WALKED rather than driven, which the first cut of this got wrong: a
    // driven actor thrusts along its FACING, and facing nothing in particular
    // it went straight up and never reached a side edge at all.
    const source = wrapsAcrossEnhancement.apply(
      topDownControlsEnhancement.apply(withCoin(), COIN),
      COIN,
    );
    const {world, coin} = await roomWith(source, 300, 160);
    play(world, 4, ['ArrowRight']);

    // Walked right, off the right edge, and in at the left: it is now to the
    // LEFT of where it started rather than far to the right.
    expect(coin.get(PositionProperty).x).toBeLessThan(300);
  });

  it('holds a jetpack actor up, and drops it when the key is let go', async () => {
    const {world, coin} = await roomWith(
      jetpackEnhancement.apply(withCoin(), COIN),
    );
    play(world, 0.5, [' ']);
    const lifted = coin.get(PositionProperty).y;
    // LONGER THAN THE THRUST, because letting go is not stopping: it is still
    // going up when the key comes off and coasts higher before gravity has
    // it. Half a second measured that coast and read it as a failure to fall.
    play(world, 2);
    const fell = coin.get(PositionProperty).y;

    // Up is a smaller y. Thrust raised it; letting go let gravity have it.
    expect(lifted).toBeLessThan(160);
    expect(fell).toBeGreaterThan(lifted);
  });
});
