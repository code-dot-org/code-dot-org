// A bag, and the things that go in it.
//
// The pair shape again — a carrier and something carryable — with one
// deliberate difference from riding and from walking on ice: the taker's row
// is offered whatever the project holds. A key that can be carried before
// anything can carry it is a key waiting for a bag, and the learner is very
// likely making the bag next.

import {describe, expect, it} from 'vitest';

import {WORLD_SCENARIOS} from '../../../fixtures/scenarios';
import {fileIdAt} from '../../../runtime/projectFiles';
import {importStockActor} from '../../importStockActor';
import {stockActorById} from '../../stock';
import {canBeCarriedEnhancement, carriesThingsEnhancement} from '../inventory';

const PLAYER = {
  kind: 'actor' as const,
  path: 'actors/player',
  name: 'Platformer Player',
};
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

const project = () => withActors('player', 'coin');

describe('having a bag', () => {
  it('writes into the thing as well as the carrier', () => {
    const after = carriesThingsEnhancement.apply(
      project(),
      PLAYER,
      'actors/coin',
    );

    expect(at(after, 'actors/player.actor')).toContain(
      'Inventory#CarriesTrait',
    );
    expect(at(after, 'actors/coin.actor')).toContain(
      'Inventory#CanBeCarriedTrait',
    );
    expect(at(after, 'rules/inventory.rule')).toBeTruthy();
  });

  it('is not done until the thing may be carried', () => {
    const after = carriesThingsEnhancement.apply(
      project(),
      PLAYER,
      'actors/coin',
    );

    expect(carriesThingsEnhancement.applied(after, PLAYER, 'actors/coin')).toBe(
      true,
    );
    expect(
      carriesThingsEnhancement.applied(project(), PLAYER, 'actors/coin'),
    ).toBe(false);
  });

  it('does nothing without an answer', () => {
    const before = project();
    expect(carriesThingsEnhancement.apply(before, PLAYER)).toBe(before);
  });
});

describe('being carryable', () => {
  it('is offered whatever the project holds', () => {
    // Unlike riding a platform or walking on ice, which are nonsense with
    // nothing to ride and no ice. A key waiting for a bag is not nonsense.
    expect(canBeCarriedEnhancement.offered).toBeUndefined();
  });

  it('elects the one trait, and asks nothing', () => {
    const after = canBeCarriedEnhancement.apply(project(), COIN);

    expect(canBeCarriedEnhancement.asks).toBeUndefined();
    expect(at(after, 'actors/coin.actor')).toContain(
      'Inventory#CanBeCarriedTrait',
    );
    expect(at(after, 'actors/coin.actor')).not.toContain(
      'Inventory#CarriesTrait',
    );
  });

  it('is not the collecting row', () => {
    // Collection keeps a record and a record only grows; a bag gives things
    // back. The two rows sit next to each other, so the difference has to be
    // in what they write as well as in what they say.
    //
    // ASKED AS A DIFFERENCE, because the stock Coin ships as a collectible:
    // "the Coin has no Collection trait" was a claim about the Coin, and a
    // false one. What is being claimed is that this row does not add one.
    const before = at(project(), 'actors/coin.actor')!;
    const after = at(
      canBeCarriedEnhancement.apply(project(), COIN),
      'actors/coin.actor',
    )!;
    const collection = (text: string) =>
      [...text.matchAll(/Collection#/g)].length;

    expect(collection(after)).toBe(collection(before));
  });

  it('does nothing the second time', () => {
    const once = canBeCarriedEnhancement.apply(project(), COIN);
    expect(canBeCarriedEnhancement.applied(once, COIN)).toBe(true);
    expect(
      at(canBeCarriedEnhancement.apply(once, COIN), 'actors/coin.actor'),
    ).toBe(at(once, 'actors/coin.actor'));
  });
});
