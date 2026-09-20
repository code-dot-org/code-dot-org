// A screen over a screen: who input may reach.
//
// The arithmetic behind `⟨…⟩ can be reached`, tested without a rule, a
// pointer or a block in sight — which is the point of it living on the World.
// What the rules do with the answer is theirs; that it is the RIGHT answer is
// here (specs/MODALITY_PLAN.md).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {WorldMap} from '../core/World';

const sheet = (id: string, modal = false): WorldMap => ({
  actors: [{type: 'actors/card', id}],
  ...(modal ? {modal: true} : {}),
});

const world = () =>
  new WorldBuilder({id: 'w', name: 'W'})
    .define('actors/card', new ActorBuilder({id: 'card', name: 'Card'}))
    .getWorld();

const named = (from: ReturnType<typeof world>, id: string) =>
  [...from.actors].find(actor => actor.id === id)!;

describe('what a modal screen covers', () => {
  it('reaches everything while nothing is modal', () => {
    const w = world();
    w.loadMap(sheet('Home'));
    w.loadMap(sheet('Hud'));

    expect(w.canReach(named(w, 'Home'))).toBe(true);
    expect(w.canReach(named(w, 'Hud'))).toBe(true);
  });

  it('covers what is under it, and not itself', () => {
    const w = world();
    w.loadMap(sheet('Home'));
    w.loadMap(sheet('Dialog', true));

    expect(w.canReach(named(w, 'Home'))).toBe(false);
    expect(w.canReach(named(w, 'Dialog'))).toBe(true);
  });

  it('does not cover what is loaded ABOVE it', () => {
    // The case the whole design turns on: an on-screen keyboard goes on over
    // a form and is not itself a screen. Measured from the top of the stack
    // instead, the form it types into would be locked out.
    const w = world();
    w.loadMap(sheet('Home'));
    w.loadMap(sheet('Form', true));
    w.loadMap(sheet('Keyboard'));

    expect(w.canReach(named(w, 'Home'))).toBe(false);
    expect(w.canReach(named(w, 'Form'))).toBe(true);
    expect(w.canReach(named(w, 'Keyboard'))).toBe(true);
  });

  it('measures from the TOPMOST modal, with two of them stacked', () => {
    const w = world();
    w.loadMap(sheet('Home'));
    w.loadMap(sheet('First', true));
    w.loadMap(sheet('Second', true));

    expect(w.canReach(named(w, 'Home'))).toBe(false);
    expect(w.canReach(named(w, 'First'))).toBe(false);
    expect(w.canReach(named(w, 'Second'))).toBe(true);
  });

  it('gives it back when the screen in front goes away', () => {
    const w = world();
    w.loadMap(sheet('Home'));
    w.loadMap(sheet('Dialog', true));
    expect(w.canReach(named(w, 'Home'))).toBe(false);

    w.unloadNewestMap();
    expect(w.canReach(named(w, 'Home'))).toBe(true);
  });

  it('covers an actor no map placed, which is behind everything', () => {
    // `add actor` in a world's body, or a bullet a handler made: they belong
    // to no load, and a dialog over a game has to cover the game.
    const w = world();
    const loose = new ActorBuilder({id: 'card', name: 'Card'}).instantiate();
    w.addActor(loose);
    expect(w.canReach(loose)).toBe(true);

    w.loadMap(sheet('Dialog', true));
    expect(w.canReach(loose)).toBe(false);
  });
});
