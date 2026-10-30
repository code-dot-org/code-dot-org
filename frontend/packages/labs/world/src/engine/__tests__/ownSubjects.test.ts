// A kind's handler about its own actor property, heard by every actor of
// the kind (specs/OWN_SUBJECTS_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {Actor} from '../core/Actor';
import type {GameEvent} from '../core/types';

const HURT: GameEvent = {id: 'hurt', ownerId: 'rules/health'};

/** A bar kind whose own `subject` hears `hurt`, and a world with two players. */
const makeWorld = () => {
  const heard: string[] = [];
  const bar = new ActorBuilder({id: 'bar', name: 'Bar'});
  const subject = bar.defineProperty('subject', 'actor', [] as Actor[]);
  bar.onOwnSubject(subject as never, HURT, (_world, actor, about, amount) =>
    heard.push(`${actor.id} ${about.id} ${amount}`),
  );
  const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
  world.define('actors/bar', bar);
  world.define(
    'actors/player',
    new ActorBuilder({id: 'player', name: 'Player'}),
  );
  const [one, two, barOne, barTwo] = world.loadWorldMap({
    actors: [
      {type: 'actors/player', id: 'One'},
      {type: 'actors/player', id: 'Two'},
      {type: 'actors/bar', id: 'BarOne'},
      {type: 'actors/bar', id: 'BarTwo'},
    ],
  });
  barOne.set(subject, [one]);
  barTwo.set(subject, [two]);
  return {world, heard, bar, subject, one, two, barOne, barTwo};
};

describe('a kind’s hat about its own property', () => {
  it('is heard by each actor of the kind about its own subject', () => {
    const {world, heard, one, two} = makeWorld();
    world.emit(HURT, one, 1);
    world.emit(HURT, two, 2);
    world.tick(1 / 60);
    expect(heard).toEqual(['BarOne One 1', 'BarTwo Two 2']);
  });

  it('follows the property when it is set to another', () => {
    const {world, heard, subject, one, two, barOne} = makeWorld();
    barOne.set(subject, [two]);
    world.emit(HURT, one, 1);
    world.emit(HURT, two, 1);
    world.tick(1 / 60);
    expect(heard).toEqual(['BarOne Two 1', 'BarTwo Two 1']);
  });

  it('is heard by an actor of the kind added later', () => {
    const {world, heard, bar, subject, one} = makeWorld();
    const late = world.addActor(bar.instantiate('Late', 'actors/bar'));
    late.set(subject, [one]);
    world.emit(HURT, one, 1);
    world.tick(1 / 60);
    expect(heard).toEqual(['BarOne One 1', 'Late One 1']);
  });

  it('is not heard by a removed actor, nor about one', () => {
    const {world, heard, one, two, barOne} = makeWorld();
    world.removeActor(barOne);
    world.tick(1 / 60);
    world.emit(HURT, one, 1);
    world.emit(HURT, two, 1);
    world.removeActor(two);
    world.tick(1 / 60);
    expect(heard).toEqual([]);
  });

  it('runs after the subject’s own handlers, as the listener', () => {
    const {world, heard, one} = makeWorld();
    one.on(HURT, () => heard.push('own'));
    world.emit(HURT, one, 1);
    world.tick(1 / 60);
    expect(heard).toEqual(['own', 'BarOne One 1']);
  });

  it('comes with the kind an actor acts like', () => {
    const {world, heard, bar, subject, two} = makeWorld();
    const big = new ActorBuilder({id: 'bigBar', name: 'Big Bar'}).actsLike(bar);
    const actor = world.addActor(big.instantiate('Big', 'actors/bigBar'));
    actor.set(subject, [two]);
    world.emit(HURT, two, 3);
    world.tick(1 / 60);
    expect(heard).toEqual(['BarTwo Two 3', 'Big Two 3']);
  });
});
