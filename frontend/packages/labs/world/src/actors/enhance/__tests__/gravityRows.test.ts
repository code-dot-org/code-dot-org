// Falling, and having something to land on — one sentence from two ends.
//
// Gravity arrives with `Jumps` for a player and with nothing at all for
// anything else, which is why these two rows exist: the Crawler patrols at a
// fixed height and the Blob is pulled onto the floor, and until now the shelf
// could make the first and not the second (`fixtures/jetpack`).
//
// The half that cannot be checked by reading is whether an actor given one row
// actually comes to rest on an actor given the other.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {fallsEnhancement} from '../falls';
import {holdsThingsUpEnhancement} from '../holdsThingsUp';
import {platformerControlsEnhancement} from '../platformerControls';

const COIN = {kind: 'actor' as const, path: 'actors/coin', name: 'Coin'};
const LABEL = {kind: 'actor' as const, path: 'actors/label', name: 'Label'};

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

describe('falling', () => {
  it('elects the trait and brings the rule', () => {
    const after = fallsEnhancement.apply(withActors('coin'), COIN);

    expect(at(after, 'actors/coin.actor')).toContain(
      'Gravity#AffectedByGravityTrait',
    );
    expect(at(after, 'rules/gravity.rule')).toBeTruthy();
  });

  it('gives no keys and no jump with it', () => {
    // The whole of what separates this from the platformer row: an actor that
    // must not be steered is pulled down and handed nothing to steer with.
    const actor = at(
      fallsEnhancement.apply(withActors('coin'), COIN),
      'actors/coin.actor',
    )!;

    expect(actor).not.toContain('JumpsTrait');
    expect(actor).not.toContain('TakesKeyboardInputTrait');
    expect(actor).not.toContain('world_on_Input_PressesEvent');
  });

  it('counts an actor that jumps as already falling', () => {
    // A trait brings its own dependencies, so `Jumps` IS being pulled down.
    // Offering this to a platformer player would write a second line saying
    // what the first already says — which is why the stock Player says
    // neither twice.
    const player = platformerControlsEnhancement.apply(
      withActors('coin'),
      COIN,
    );

    expect(fallsEnhancement.applied(player, COIN)).toBe(true);
    expect(at(fallsEnhancement.apply(player, COIN), 'actors/coin.actor')).toBe(
      at(player, 'actors/coin.actor'),
    );
  });

  it('does nothing the second time', () => {
    const once = fallsEnhancement.apply(withActors('coin'), COIN);
    expect(fallsEnhancement.applied(once, COIN)).toBe(true);
    expect(at(fallsEnhancement.apply(once, COIN), 'actors/coin.actor')).toBe(
      at(once, 'actors/coin.actor'),
    );
  });
});

describe('holding things up', () => {
  it('elects both traits, which are two different claims', () => {
    // `Acts as Ground` is what gravity's landing step looks for; `Solid` is
    // what stops a body passing through one. A ledge wants both.
    const after = holdsThingsUpEnhancement.apply(withActors('label'), LABEL);
    const actor = at(after, 'actors/label.actor')!;

    expect(actor).toContain('Gravity#ActsAsGroundTrait');
    expect(actor).toContain('Solid Bodies#SolidTrait');
    expect(at(after, 'rules/gravity.rule')).toBeTruthy();
    expect(at(after, 'rules/solid.rule')).toBeTruthy();
  });

  it('does not make the floor fall', () => {
    expect(
      at(
        holdsThingsUpEnhancement.apply(withActors('label'), LABEL),
        'actors/label.actor',
      ),
    ).not.toContain('AffectedByGravityTrait');
  });

  it('does nothing the second time', () => {
    const once = holdsThingsUpEnhancement.apply(withActors('label'), LABEL);
    expect(holdsThingsUpEnhancement.applied(once, LABEL)).toBe(true);
    expect(
      at(holdsThingsUpEnhancement.apply(once, LABEL), 'actors/label.actor'),
    ).toBe(at(once, 'actors/label.actor'));
  });
});

/** `add actor ⟨path⟩`, put at one place. */
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

describe('the two rows, played', () => {
  /** A Label made into a floor, with a Coin made to fall, dropped on it. */
  const room = () => {
    let source = withActors('coin', 'label');
    source = fallsEnhancement.apply(source, COIN);
    source = holdsThingsUpEnhancement.apply(source, LABEL);
    return roomOf(source, [
      ['actors/label', 160, 300],
      ['actors/coin', 160, 100],
    ]);
  };

  it('drops the one and is caught by the other', async () => {
    const {world} = await compileProject(projectFiles(room()));
    const coin = placedAt(world, 160, 100);

    play(world, 0.2);
    expect(coin.get(PositionProperty).y).toBeGreaterThan(100);

    play(world, 3);
    const landed = coin.get(PositionProperty).y;
    play(world, 2);

    // Came to rest, and came to rest ABOVE the floor rather than inside it.
    // A Label with neither trait catches nothing and the coin is far below by
    // now — which is exactly what this pair of rows exists to prevent.
    expect(coin.get(PositionProperty).y).toBeCloseTo(landed, 3);
    expect(landed).toBeLessThan(300);
  });

  it('drops straight through a floor that was not told to hold things up', async () => {
    // The control, and the reason the second row is not decoration.
    const bare = roomOf(
      fallsEnhancement.apply(withActors('coin', 'label'), COIN),
      [
        ['actors/label', 160, 300],
        ['actors/coin', 160, 100],
      ],
    );
    const {world} = await compileProject(projectFiles(bare));
    const coin = placedAt(world, 160, 100);

    play(world, 3);

    expect(coin.get(PositionProperty).y).toBeGreaterThan(300);
  });
});
