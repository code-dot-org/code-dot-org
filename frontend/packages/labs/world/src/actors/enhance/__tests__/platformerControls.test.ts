// Platformer controls — as edits, as an assembly, and then as a game.
//
// Three traits out of three rules and one key binding. What reading the code
// cannot tell is whether those blocks compile into a world that runs, and
// whether they are the same blocks the stock Platformer Player is made of —
// which they have to be, since the actor and the enhancement assemble the same
// thing and nothing but this makes them keep agreeing.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {playerActor} from '../../stock/player';
import {platformerControlsEnhancement} from '../platformerControls';

/** A Coin: something in the library that is emphatically not a platformer. */
const COIN = {
  kind: 'actor' as const,
  path: 'actors/coin',
  name: 'Coin',
};

const withCoin = () =>
  importStockActor(WORLD_SCENARIOS.empty.source, stockActorById('coin')!)
    .source;

const at = (source: ReturnType<typeof withCoin>, path: string) => {
  const id = fileIdAt(source, path);
  return id ? source.files[id].contents : undefined;
};

const enhanced = () => platformerControlsEnhancement.apply(withCoin(), COIN);

describe('the platformer-controls enhancement, as edits', () => {
  it('gives the actor all three traits and the jump binding', () => {
    const actor = at(enhanced(), 'actors/coin.actor')!;

    expect(actor).toContain('Jumping#JumpsTrait');
    expect(actor).toContain('Arrow Keys#MovesAcrossTrait');
    expect(actor).toContain('Input#TakesKeyboardInputTrait');
    expect(actor).toContain('world_on_Input_PressesEvent');
    expect(actor).toContain('world_do_Jumping_MakeJumpAction');
  });

  it('elects across and not down, so the up arrow does not fly', () => {
    // `Arrow Keys` has two traits and wanting one is not wanting the other:
    // "Moves Down" is for a game seen from above, and a platformer that took
    // it would have an up arrow that flies and a down arrow that beats gravity
    // into the floor (`rules/stock/arrows`).
    expect(at(enhanced(), 'actors/coin.actor')).not.toContain('MovesDownTrait');
  });

  it('says nothing about gravity, which the jump already requires', () => {
    // "Jumps" is written against "Affected by Gravity" and a trait brings its
    // own dependencies, so electing both would say the same thing twice — the
    // same reason the stock Player says neither.
    expect(at(enhanced(), 'actors/coin.actor')).not.toContain(
      'AffectedByGravityTrait',
    );
    // …and the rule is in the project all the same, which is what `brings`
    // promises a learner reading the row.
    expect(at(enhanced(), 'rules/gravity.rule')).toBeTruthy();
    expect(platformerControlsEnhancement.brings).toContain('Has Gravity');
  });

  it('brings the three rules its traits come out of', () => {
    const after = enhanced();

    expect(at(after, 'rules/jump.rule')).toBeTruthy();
    expect(at(after, 'rules/arrows.rule')).toBeTruthy();
    expect(at(after, 'rules/input.rule')).toBeTruthy();
  });

  it('asks the actor to jump, not nobody', () => {
    // A designed block's one parameter socket is `VALUE` whatever the
    // parameter is called. Written as `ACTOR` the socket is empty, the block
    // asks nobody to jump, and nothing anywhere complains.
    const actor = at(enhanced(), 'actors/coin.actor')!;
    const sockets = [
      ...actor.matchAll(
        /world_do_Jumping_MakeJumpAction[\s\S]{0,140}?"(VALUE|ACTOR)"/g,
      ),
    ].map(one => one[1]);

    expect(sockets).toEqual(['VALUE']);
  });

  it('does nothing the second time', () => {
    const once = enhanced();
    expect(platformerControlsEnhancement.applied(once, COIN)).toBe(true);

    expect(
      at(platformerControlsEnhancement.apply(once, COIN), 'actors/coin.actor'),
    ).toBe(at(once, 'actors/coin.actor'));
  });

  it('does not read somebody else’s space bar as a jump', () => {
    // Where this parts company with the climb enhancement, which asks only
    // whether a press is bound. A project may well press space to shoot or to
    // talk, and reading that as "already jumps" would leave an actor that can
    // never be given a jump — silently, since an enhancement that believes it
    // is applied does nothing at all.
    //
    // Built out of the stock Player, which really does bind space, by taking
    // the jump out from under the hat and leaving the hat where it is.
    const player = {kind: 'actor' as const, path: 'actors/player', name: 'P'};
    const withPlayer = importStockActor(
      WORLD_SCENARIOS.empty.source,
      stockActorById('player')!,
    ).source;
    const id = fileIdAt(withPlayer, 'actors/player.actor')!;
    expect(platformerControlsEnhancement.applied(withPlayer, player)).toBe(
      true,
    );

    const shooting = {
      ...withPlayer,
      files: {
        ...withPlayer.files,
        [id]: {
          ...withPlayer.files[id],
          contents: withPlayer.files[id].contents.replace(
            'world_do_Jumping_MakeJumpAction',
            'world_restart',
          ),
        },
      },
    };

    expect(platformerControlsEnhancement.applied(shooting, player)).toBe(false);
    // …and enhancing it writes the jump back, in a hat of its own BESIDE the
    // one that is there. The learner's space handler is theirs; an enhancement
    // adds blocks they could have written and never edits blocks they did.
    const fixed = platformerControlsEnhancement.apply(shooting, player);
    const contents = at(fixed, 'actors/player.actor')!;
    expect(contents).toContain('world_do_Jumping_MakeJumpAction');
    expect([...contents.matchAll(/"FILTER0": "space"/g)]).toHaveLength(2);
  });
});

describe('the platformer-controls enhancement, and the actor that is one', () => {
  it('assembles what the stock Platformer Player is assembled from', () => {
    // The library ships a platformer as an ACTOR and offers it as an
    // enhancement, and the two say the same thing about what a platformer is.
    // Written twice they would drift, and the one that drifted would be the
    // one nobody was looking at.
    const traits = (contents: string) =>
      [...contents.matchAll(/"TRAIT":\s*"([^"]+)"/g)].map(one => one[1]).sort();
    const actor = at(enhanced(), 'actors/coin.actor')!;

    for (const trait of traits(playerActor)) {
      expect(traits(actor), trait).toContain(trait);
    }
    // …and the same key, bound to the same action.
    expect(playerActor).toContain('"FILTER0": "space"');
    expect(actor).toContain('"FILTER0": "space"');
    expect(playerActor).toContain('world_do_Jumping_MakeJumpAction');
  });
});

/** `add actor ⟨path⟩`, put at one place — the shape `playerFalls` uses. */
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

/**
 * The enhanced Coin, dropped on a stock Ground.
 *
 * A COIN, which is the point: it is a thing in the library that is emphatically
 * not a platformer, and the enhancement's whole claim is that it makes the
 * actor the learner already has walk and jump. If this had used the Player it
 * would have proved that a platformer is a platformer.
 */
const room = () => {
  let source = platformerControlsEnhancement.apply(withCoin(), COIN);
  source = importStockActor(source, stockActorById('ground')!).source;
  const world = Object.values(source.files).find(
    file => file.name === 'main.world',
  )!;
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
                next: {
                  block: {
                    ...place('actors/ground', 160, 300),
                    next: {block: place('actors/coin', 160, 100)},
                  },
                },
              },
            ],
          },
        }),
      },
    },
  };
};

/**
 * Tick for `seconds` at sixty frames a second, holding `keys` throughout.
 *
 * The keys are the BROWSER's names, translated at the door by `keyName`, which
 * is the road a real press travels: a test that fed the lab's own names would
 * be testing a control scheme nobody at a keyboard can reach (`sokobanPlays`
 * says the same, and jetpackPlays after it).
 */
const play = (world: World, seconds: number, keys: string[] = []): void => {
  for (let frame = 0; frame < Math.round(seconds * 60); frame++) {
    world.setInput(keys.map(keyName));
    world.tick(1 / 60);
  }
};

/** The actor that started at `y` — an id is generated, a placement is not. */
const startingAt = (world: World, y: number) =>
  [...world.actors].find(actor => actor.get(PositionProperty).y === y)!;

describe('the platformer-controls enhancement, played', () => {
  it('compiles into a world that runs', async () => {
    // What reading cannot tell: whether the blocks it wrote are ones the
    // project can actually build. A mistyped block type is minted as a
    // stand-in and draws fine while doing nothing.
    const {world, modules} = await compileProject(projectFiles(enhanced()));

    expect(world).toBeDefined();
    expect(modules['rules/jump']).toBeDefined();
    expect(modules['rules/arrows']).toBeDefined();
    expect(modules['rules/input']).toBeDefined();
    // Gravity is nobody's import here and is in the project anyway, because
    // Jumping is written against it.
    expect(modules['rules/gravity']).toBeDefined();
  });

  it('falls, and lands on what is solid', async () => {
    const {world} = await compileProject(projectFiles(room()));
    const coin = startingAt(world, 100);

    play(world, 0.2);
    expect(coin.get(PositionProperty).y).toBeGreaterThan(100);

    play(world, 3);
    const landed = coin.get(PositionProperty).y;
    play(world, 1);

    expect(coin.get(PositionProperty).y).toBeCloseTo(landed, 3);
    expect(landed).toBeLessThan(300);
  });

  it('walks the way the arrow points', async () => {
    const {world} = await compileProject(projectFiles(room()));
    const coin = startingAt(world, 100);
    play(world, 3);

    const from = coin.get(PositionProperty).x;
    play(world, 1, ['ArrowRight']);
    const right = coin.get(PositionProperty).x;
    play(world, 1, ['ArrowLeft']);

    expect(right).toBeGreaterThan(from);
    expect(coin.get(PositionProperty).x).toBeLessThan(right);
  });

  it('jumps on the space bar, and only from the ground', async () => {
    const {world} = await compileProject(projectFiles(room()));
    const coin = startingAt(world, 100);
    play(world, 3);
    const floor = coin.get(PositionProperty).y;

    // One frame of the key: long enough for the press, short of a release —
    // and a jump is a press, so holding it longer would prove nothing extra.
    play(world, 1 / 60, [' ']);
    let highest = coin.get(PositionProperty).y;
    for (let frame = 0; frame < 60; frame++) {
      play(world, 1 / 60);
      highest = Math.min(highest, coin.get(PositionProperty).y);
    }

    expect(highest).toBeLessThan(floor - 8);

    // …and it comes back down, which is the gravity half of the same claim: a
    // jump that never came down would be a flight key. Given time to land — a
    // second of arc is not the whole of one, and the first cut of this asked
    // while the coin was still in the air.
    play(world, 3);
    expect(coin.get(PositionProperty).y).toBeCloseTo(floor, 3);
  });
});
