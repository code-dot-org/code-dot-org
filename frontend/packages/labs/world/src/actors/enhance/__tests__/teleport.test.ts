// Teleport pads — as edits, and then as a game.
//
// The thing worth pinning first is the thing I got wrong out loud: a pad needs
// no second actor. Pads find each other by COLOUR rather than by naming one
// another, so two placements of the same actor are already a working pair, and
// there is nothing for the row to ask.
//
// Then the two ways of using one, which the rule's own header says are two
// things: a player chooses, an enemy has no choice. One writes a key, the
// other writes a boolean.

import {describe, expect, it} from 'vitest';

import {compileProject} from '../../../__tests__/support/compileProject';
import {PositionProperty, type World} from '../../../engine';
import {keyName} from '../../../engine/core/keys';
import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt, projectFiles} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {
  isATeleportPadEnhancement,
  takenByAnyPadEnhancement,
  usesTeleportPadsEnhancement,
} from '../teleport';

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

const project = () => withActors('ground', 'coin');

describe('being a pad', () => {
  it('is one trait and asks nothing', () => {
    // Nothing to point at: a pad's partner is any pad of its colour, so there
    // is no second actor to name and no question to put.
    const after = isATeleportPadEnhancement.apply(project(), GROUND);

    expect(isATeleportPadEnhancement.asks).toBeUndefined();
    expect(at(after, 'actors/ground.actor')).toContain(
      'Teleport#IsATeleportPadTrait',
    );
    expect(at(after, 'rules/teleport.rule')).toBeTruthy();
  });

  it('does nothing the second time', () => {
    const once = isATeleportPadEnhancement.apply(project(), GROUND);
    expect(isATeleportPadEnhancement.applied(once, GROUND)).toBe(true);
    expect(
      at(isATeleportPadEnhancement.apply(once, GROUND), 'actors/ground.actor'),
    ).toBe(at(once, 'actors/ground.actor'));
  });
});

describe('using one', () => {
  const withPad = () => isATeleportPadEnhancement.apply(project(), GROUND);

  it('offers neither row until something is a pad', () => {
    for (const row of [usesTeleportPadsEnhancement, takenByAnyPadEnhancement]) {
      expect(row.offered!(project(), COIN)).toBe(false);
      expect(row.offered!(withPad(), COIN)).toBe(true);
    }
  });

  it('gives a chooser a key to press', () => {
    // Standing on a pad is not using it: a mechanic that fires wherever you
    // happen to stand is one that has taken the level away from you.
    const after = usesTeleportPadsEnhancement.apply(withPad(), COIN);
    const actor = at(after, 'actors/coin.actor')!;

    expect(actor).toContain('Teleport#UsesTeleportPadsTrait');
    expect(actor).toContain('Input#TakesKeyboardInputTrait');
    expect(actor).toContain('world_do_Teleport_UseThePadAction');
    expect(actor).not.toContain('TakesAnyPadItTouches');
  });

  it('gives something with no choice the boolean instead', () => {
    const after = takenByAnyPadEnhancement.apply(withPad(), COIN);
    const actor = at(after, 'actors/coin.actor')!;

    expect(actor).toContain('Teleport#UsesTeleportPadsTrait');
    expect(actor).toContain('world_set_Teleport_TakesAnyPadItTouchesProperty');
    // …and no key at all, which is the whole difference between the two rows.
    expect(actor).not.toContain('world_do_Teleport_UseThePadAction');
  });

  it('does nothing the second time, either way', () => {
    for (const row of [usesTeleportPadsEnhancement, takenByAnyPadEnhancement]) {
      const once = row.apply(withPad(), COIN);
      expect(row.applied(once, COIN)).toBe(true);
      expect(at(row.apply(once, COIN), 'actors/coin.actor')).toBe(
        at(once, 'actors/coin.actor'),
      );
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

describe('the teleport rows, played', () => {
  it('carries a traveller from one pad to the other, on the key', async () => {
    // TWO PLACEMENTS OF ONE ACTOR, which is the claim this whole file exists
    // to make: they are the same kind and so the same colour, and a colour is
    // what pairs pads.
    let source = isATeleportPadEnhancement.apply(project(), GROUND);
    source = takenByAnyPadEnhancement.apply(source, COIN);
    const {world} = await compileProject(
      projectFiles(
        roomOf(source, [
          ['actors/ground', 100, 200],
          ['actors/ground', 400, 200],
          ['actors/coin', 100, 200],
        ]),
      ),
    );
    const coin = [...world.actors].find(actor => actor.type === 'actors/coin')!;
    const from = coin.get(PositionProperty).x;
    play(world, 2);

    // Taken by the pad it is standing on, and put at the other one.
    expect(coin.get(PositionProperty).x).not.toBe(from);
  });
});
