// Actors by the name a map gave them (`World.actorsNamed`, `World.named`).
//
// A hat about "the actor named Resume" is written before the world holds
// any such actor — a pause menu's buttons arrive when its map is loaded — so
// what it registers on must remember the handler and hand it to the actor
// when one is placed, as a template does for its kind.

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';

const Ping = new RuleBuilder({id: 'pinger', name: 'Pinger'}).addEvent('ping');

const makeWorld = () => new WorldBuilder({id: 'w', name: 'W'}).instantiate();

/** Place an actor under `id`, as `load map` does. */
const place = (world: ReturnType<typeof makeWorld>, id: string) =>
  world.addActor(new ActorBuilder({id, name: id}).instantiate());

describe('actorsNamed', () => {
  it('finds the actor placed under the name', () => {
    const world = makeWorld();
    const resume = place(world, 'Resume');
    place(world, 'Quit');

    expect(world.actorsNamed('Resume')).toEqual([resume]);
    expect(world.actorsNamed('Nobody')).toEqual([]);
  });

  it('counts a second copy of the name, numbered by the world', () => {
    // A map loaded twice numbers its second Resume `Resume#2`; a handler
    // about "Resume" is about both.
    const world = makeWorld();
    const template = new ActorBuilder({id: 'Resume', name: 'Resume'});
    const first = world.addActor(template, 'Resume');
    const second = world.addActor(template, 'Resume');

    expect(second.id).toBe('Resume#2');
    expect(world.actorsNamed('Resume')).toEqual([first, second]);
  });
});

describe('named(…).on', () => {
  it('reaches the actor placed already', () => {
    const world = makeWorld();
    const resume = place(world, 'Resume');
    const heard: string[] = [];
    world.named('Resume').on(Ping, (_world, actor) => {
      heard.push(actor.id);
    });

    world.emit(Ping, resume);
    world.tick(0);

    expect(heard).toEqual(['Resume']);
  });

  it('reaches the actor placed later, and not one of another name', () => {
    const world = makeWorld();
    const heard: string[] = [];
    world.named('Resume').on(Ping, (_world, actor) => {
      heard.push(actor.id);
    });
    const resume = place(world, 'Resume');
    const quit = place(world, 'Quit');

    world.emit(Ping, quit);
    world.emit(Ping, resume);
    world.tick(0);

    expect(heard).toEqual(['Resume']);
  });

  it('is a kind’s to declare, registered when the kind is first placed', () => {
    // A Pause Menu's file says `when ⟨the actor named Resume⟩ is clicked`
    // with no world in scope; the world it lands in registers it.
    const heard: string[] = [];
    const menu = new ActorBuilder({id: 'menu', name: 'Menu'});
    menu.named('Resume').on(Ping, (_world, actor) => {
      heard.push(actor.id);
    });
    const world = makeWorld();
    world.addActor(menu, 'Pause');
    world.addActor(menu, 'Pause'); // a second menu adds no second answer
    const resume = place(world, 'Resume');

    world.emit(Ping, resume);
    world.tick(0);

    expect(heard).toEqual(['Resume']);
  });

  it('is copied down by `acts like`, as every handler is', () => {
    const heard: string[] = [];
    const base = new ActorBuilder({id: 'base', name: 'Base'});
    base.named('Resume').on(Ping, (_world, actor) => {
      heard.push(actor.id);
    });
    const menu = new ActorBuilder({id: 'menu', name: 'Menu'}).actsLike(base);
    const world = makeWorld();
    world.addActor(menu, 'Pause');
    world.emit(Ping, place(world, 'Resume'));
    world.tick(0);

    expect(heard).toEqual(['Resume']);
  });

  it('is the builder’s too, for a hat written under `define world`', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const heard: string[] = [];
    builder.named('Resume').on(Ping, (_world, actor) => {
      heard.push(actor.id);
    });
    const world = builder.getWorld();
    const resume = place(world, 'Resume');

    world.emit(Ping, resume);
    world.tick(0);

    expect(heard).toEqual(['Resume']);
    expect(builder.actorsNamed('Resume')).toEqual([resume]);
  });
});
