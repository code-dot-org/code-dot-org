// A property a KIND of actor declares for itself, owned by no trait.
//
// The shorthand for state that needs no mechanic around it — when a Player last
// fired, how much ammo it has. What these pin is that it is per INSTANCE (the
// bug it exists to avoid is one shared slot for every Player) and that no trait
// is invented to hold it.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../index';

const template = (id: string) => new ActorBuilder({id, name: id});

describe('an actor kind’s own property', () => {
  it('gives every instance a slot holding the declared default', () => {
    const player = template('player');
    const LastFired = player.defineProperty('last_fired', 'number', 0);

    expect(player.instantiate('a').get(LastFired)).toBe(0);
    expect(player.instantiate('b').get(LastFired)).toBe(0);
  });

  it('is per instance, not shared by the kind', () => {
    // The whole reason it is a property and not a module-level variable in the
    // generated file. Two ships firing must not share one cooldown.
    const player = template('player');
    const LastFired = player.defineProperty('last_fired', 'number', 0);
    const first = player.instantiate('first');
    const second = player.instantiate('second');

    first.set(LastFired, 3);

    expect(first.get(LastFired)).toBe(3);
    expect(second.get(LastFired)).toBe(0);
  });

  it('invents no trait to hold it', () => {
    // A trait is elected, shareable between kinds, and answerable by
    // `has trait`. This is none of those, so synthesizing one would put a trait
    // the learner never wrote into what an actor reports it has.
    const player = template('player');
    player.defineProperty('last_fired', 'number', 0);

    expect(
      player
        .instantiate('a')
        .traits()
        .map(t => t.id),
    ).toEqual(
      template('bare')
        .instantiate('b')
        .traits()
        .map(t => t.id),
    );
  });

  it('keeps two kinds’ same-named properties apart', () => {
    // Slots are keyed by the property object, so a Coin's `last fired` and a
    // Player's are different slots however alike they read.
    const player = template('player');
    const coin = template('coin');
    const playerFired = player.defineProperty('last_fired', 'number', 0);
    const coinFired = coin.defineProperty('last_fired', 'number', 99);

    expect(player.instantiate('p').get(playerFired)).toBe(0);
    expect(coin.instantiate('c').get(coinFired)).toBe(99);
  });

  it('survives being placed in a world', () => {
    // Placement re-reads nothing, but this is the path a real actor takes and
    // the one a generated module exercises.
    const world = new WorldBuilder({id: 'w', name: 'W'}).getWorld();
    const player = template('player');
    const Ammo = player.defineProperty('ammo', 'number', 6);

    const placed = world.addActor(player);
    placed.set(Ammo, 5);

    expect(placed.get(Ammo)).toBe(5);
  });

  it('coerces like any other property', () => {
    // It goes through the same slot machinery, so a vector default written as
    // a plain object arrives as a Vector rather than staying a bare pair.
    const player = template('player');
    const Aim = player.defineProperty('aim', 'vector', {x: 1, y: 2});

    expect(player.instantiate('a').get(Aim)).toMatchObject({x: 1, y: 2});
    expect(player.instantiate('a').get(Aim)).toBeInstanceOf(
      Object.getPrototypeOf(player.instantiate('a').get(Aim)).constructor,
    );
  });

  it('names the actor, not a trait, when a slot is missing', () => {
    // Reaching this means the property outlived the template that declared it.
    // "Is trait 'player' applied?" would send a reader looking for a `use
    // trait` row that was never the point.
    const player = template('player');
    const orphan = template('other').defineProperty('ghost', 'number', 0);

    expect(() => player.instantiate('a').get(orphan)).toThrow(
      /declared by the actor 'other'/,
    );
  });
});
