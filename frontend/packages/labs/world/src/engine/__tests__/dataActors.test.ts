// A record with no place.
//
// The mechanism is the one the engine took away on purpose: an actor with no
// positional trait is not drawn and is in nothing that walks positioned
// actors. It comes back as a DECLARATION — `is data` — so that forgetting a
// row still gives a normal actor and only saying so gives one with no place
// (specs/RECORDS_PLAN.md).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {Vector} from '../core/Vector';
import {PositionalTrait, PositionProperty} from '../rules/spatial';

/** A Note: two fields and nowhere to be. */
const Note = () =>
  new ActorBuilder({id: 'note', name: 'Note'}).isData();
const Coin = () => new ActorBuilder({id: 'coin', name: 'Coin'});

const world = () => new WorldBuilder({id: 'w', name: 'W'}).getWorld();

describe('an actor that is data', () => {
  it('is not drawn', () => {
    const one = world();
    one.addActor(Note().instantiate('a'));
    expect(one.renderSnapshot()).toHaveLength(0);
  });

  it('is still in the world, and findable', () => {
    // Which is the whole point: a project finds its records with the blocks
    // it already has.
    const one = world();
    const note = Note().instantiate('a');
    one.addActor(note);
    expect([...one.actors]).toEqual([note]);
  });

  it('has no positional trait, which is what the rest follows from', () => {
    const one = world();
    const note = Note().instantiate('a');
    one.addActor(note);
    expect(note.has(PositionalTrait)).toBe(false);
    // …and an ordinary actor still has it without asking.
    const coin = Coin().instantiate('c');
    one.addActor(coin);
    expect(coin.has(PositionalTrait)).toBe(true);
  });

  it('leaves an ordinary actor drawn, beside it', () => {
    const one = world();
    one.define('actors/coin', Coin());
    one.addActor(Note().instantiate('a'));
    one.addActor(Coin().instantiate('c'));
    expect(one.renderSnapshot().map(state => state.actor.id)).toEqual(['c']);
  });

  it('is not found by a search over places', () => {
    const one = world();
    const coin = Coin().instantiate('c');
    one.addActor(coin);
    coin.set(PositionProperty, new Vector(10, 10));
    one.addActor(Note().instantiate('a'));
    one.tick(1 / 60);

    const near = one.actorsNear({x: 10, y: 10}, 50);
    expect(near.map(actor => actor.id)).toEqual(['c']);
  });

  it('is inherited by a kind that acts like a data kind', () => {
    const child = new ActorBuilder({id: 'todo', name: 'Todo'}).actsLike(
      Note(),
    );
    expect(child.isRecord).toBe(true);
    const one = world();
    one.addActor(child.instantiate('t'));
    expect(one.renderSnapshot()).toHaveLength(0);
  });
});
