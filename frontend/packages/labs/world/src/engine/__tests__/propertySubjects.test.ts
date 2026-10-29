// An actor's event heard through a subject read when it happens
// (specs/PROPERTY_SUBJECTS_PLAN.md, step 2).

import {describe, expect, it, vi} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {Actor} from '../core/Actor';
import type {GameEvent} from '../core/types';
import type {World, WorldMap} from '../core/World';

const HURT: GameEvent = {id: 'hurt', ownerId: 'rules/health'};

const makeWorld = () => {
  const builder = new WorldBuilder({id: 'w', name: 'W'});
  const current = builder.defineProperty(
    'current_player',
    'actor',
    [] as Actor[],
    {
      name: 'current player',
    },
  );
  const world = builder.instantiate();
  world.define(
    'actors/player',
    new ActorBuilder({id: 'player', name: 'Player'}),
  );
  const [one, two] = world.loadWorldMap({
    actors: [
      {type: 'actors/player', id: 'One'},
      {type: 'actors/player', id: 'Two'},
    ],
  });
  return {world, current, one, two};
};

/** Raise `hurt` on each actor, and run the queue. */
const hurt = (world: World, ...actors: Actor[]) => {
  for (const actor of actors) {
    world.emit(HURT, actor, 1);
  }
  world.tick(1 / 60);
};

describe('a subject read when the event happens', () => {
  it('hears the actor it holds, and no other', () => {
    const {world, one, two} = makeWorld();
    const heard: string[] = [];
    let held: Actor[] = [one];
    world.onSubject(
      () => held,
      HURT,
      (_world, actor, amount) => heard.push(`${actor.id} ${amount}`),
    );

    hurt(world, one, two);
    expect(heard).toEqual(['One 1']);

    // Set to another, it follows with nothing moved.
    held = [two];
    hurt(world, one, two);
    expect(heard).toEqual(['One 1', 'Two 1']);
  });

  it('hears nothing while it holds nobody, and each while it holds several', () => {
    const {world, one, two} = makeWorld();
    const heard: string[] = [];
    let held: Actor[] | undefined;
    world.onSubject(
      () => held,
      HURT,
      (_world, actor) => heard.push(actor.id),
    );

    hurt(world, one, two);
    held = [];
    hurt(world, one, two);
    expect(heard).toEqual([]);

    held = [one, two];
    hurt(world, one, two);
    expect(heard).toEqual(['One', 'Two']);
  });

  it('reads a game value by name, as a screen’s code does', () => {
    const {world, current, one, two} = makeWorld();
    const heard: string[] = [];
    world.onSubject(
      () => world.valueNamed('current player') as Actor[],
      HURT,
      (_world, actor) => heard.push(actor.id),
    );

    world.set(current, [two]);
    hurt(world, one, two);
    expect(heard).toEqual(['Two']);
  });

  it('runs after the actor’s own handlers', () => {
    const {world, one} = makeWorld();
    const order: string[] = [];
    one.on(HURT, () => order.push('own'));
    world.onSubject(
      () => [one],
      HURT,
      () => order.push('subject'),
    );

    hurt(world, one);
    expect(order).toEqual(['own', 'subject']);
  });

  it('goes with the screen whose script hung it', () => {
    const {world, one} = makeWorld();
    const heard: string[] = [];
    const hud: WorldMap = {
      actors: [],
      script: on =>
        on.onSubject(
          () => [one],
          HURT,
          () => heard.push('heard'),
        ),
    };
    world.loadScreen({actors: []});
    world.defineMap('screens/hud', hud);

    world.showScreen('screens/hud');
    hurt(world, one);
    expect(heard).toEqual(['heard']);

    world.goBack();
    hurt(world, one);
    expect(heard).toEqual(['heard']);
  });
});

describe('a subject that holds nobody', () => {
  it('says so once, by the property’s name', () => {
    const {world, one} = makeWorld();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    world.onSubject(
      () => [],
      HURT,
      () => {},
      'current player',
    );

    hurt(world, one);
    hurt(world, one);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('“current player” holds nobody');
    warn.mockRestore();
  });

  it('counts a removed actor as nobody', () => {
    const {world, one, two} = makeWorld();
    const heard: string[] = [];
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    world.onSubject(
      () => [one],
      HURT,
      (_world, actor) => heard.push(actor.id),
      'current player',
    );
    world.removeActor(one);
    world.tick(1 / 60);

    hurt(world, two);
    expect(heard).toEqual([]);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});
