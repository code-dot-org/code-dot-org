// What a world's BODY asks for, replayed onto the world it asked for it from.
//
// A `.world` file's rows run while the world is still being described, so the
// builder records them and applies them when the world exists
// (`WorldBuilder.defer`). What the replay needs, and did not have, is the
// things those rows refer to: the actor TEMPLATES the builder was told about
// and the MAPS it was told about.
//
// The order used to be build, replay, then hand those over — so a deferred
// call that needed one found nothing. Nothing threw and nothing was logged:
// `loadMapNamed` answers an empty list for a path it does not know, so a world
// whose first row was `go to screen ⟨maps/home⟩` came up blank and correct
// looking (specs/APPS.md, found by the Notes fixture).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {WorldMap} from '../core/World';

const CARD: WorldMap = {actors: [{type: 'actors/card', id: 'Card'}]};

/** A rule with one action, which is how `go to screen` reaches a map. */
const opener = () => {
  const rule = new RuleBuilder({id: 'screens', name: 'Screens'});
  const Open = rule.addAction(
    'open',
    (world, path) => void world.loadMapNamed(String(path)),
    {params: [{name: 'screen', type: 'string'}]},
  );
  return {Rule: rule.build(), Open};
};

const card = () => new ActorBuilder({id: 'card', name: 'Card'});

describe('what a world body defers', () => {
  it('runs a rule action against a world that knows its maps', () => {
    const {Rule, Open} = opener();
    const builder = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([Rule])
      .define('actors/card', card())
      .defineMap('maps/home', CARD);

    // The body's row: a rule action, deferred like every other row.
    builder.act(Open, 'maps/home');

    const world = builder.getWorld();
    expect([...world.actors].map(actor => actor.id)).toEqual(['Card']);
  });

  it('places a map named in the body, in the order the body said it', () => {
    const {Rule, Open} = opener();
    const builder = new WorldBuilder({id: 'w', name: 'W'})
      .useRules([Rule])
      .define('actors/card', card())
      .defineMap('maps/one', CARD)
      .defineMap('maps/two', CARD);

    builder.act(Open, 'maps/one');
    builder.act(Open, 'maps/two');

    // Two loads of the same shape: the second's ids are suffixed, which is
    // how the world says these are different placements.
    const world = builder.getWorld();
    expect([...world.actors].map(actor => actor.id)).toEqual([
      'Card',
      'Card#2',
    ]);
  });

  it('still hands them over when the body asked for nothing', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'})
      .define('actors/card', card())
      .defineMap('maps/home', CARD);

    // Nothing deferred: the world is built empty, and the map is there to be
    // loaded on the first tick by whatever asks.
    const world = builder.getWorld();
    expect([...world.actors]).toHaveLength(0);
    expect(world.loadMapNamed('maps/home').map(actor => actor.id)).toEqual([
      'Card',
    ]);
  });
});
