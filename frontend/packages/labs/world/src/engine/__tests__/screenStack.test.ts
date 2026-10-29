// Screens as a stack over the one World (specs/SCREEN_STACK_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {World, WorldMap} from '../core/World';
import {
  BoxedRule,
  HasABoxTrait,
  HeightProperty,
  WidthProperty,
} from '../rules/boxed';
import {ViewportTrait} from '../rules/viewport';

/** Boxed and drawn at its box, as every interface actor is. */
const boxed = (id: string, traits = [HasABoxTrait]) =>
  new ActorBuilder({id, name: id}).useTraits(traits).defineDrawing(
    actor => Number(actor.get(WidthProperty)),
    actor => Number(actor.get(HeightProperty)),
    () => {},
  );

const at = (type: string, id: string, x = 160, y = 160) => ({
  type,
  id,
  properties: {
    positional: {position: {x, y}},
    hasABox: {width: 64, height: 32},
  },
});

/** The Main Screen: a Viewport onto the World, and a button beside it. */
const MAIN: WorldMap = {
  actors: [at('actors/window', 'Game'), at('actors/panel', 'Menu', 40, 20)],
};
/** A level with one coin in it. */
const LEVEL: WorldMap = {actors: [at('actors/coin', 'Coin', 100, 100)]};
/** A menu over everything, which hides what is under it. */
const PAUSE: WorldMap = {
  backgroundColor: '#000000',
  actors: [at('actors/panel', 'Resume')],
};
/** A scoreboard the game shows through: half clear, with a Viewport. */
const PEEK: WorldMap = {
  backgroundColor: [0, 0, 0, 0.5],
  actors: [at('actors/panel', 'Score', 40, 300), at('actors/window', 'Mini')],
};

const makeWorld = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([BoxedRule])
    .instantiate();
  world.define('actors/panel', boxed('panel'));
  world.define('actors/window', boxed('window', [HasABoxTrait, ViewportTrait]));
  world.define('actors/coin', boxed('coin'));
  world.defineMap('screens/pause', PAUSE);
  world.defineMap('screens/peek', PEEK);
  world.loadWorldMap(LEVEL);
  world.loadScreen(MAIN);
  return world;
};

const named = (world: World, id: string) =>
  [...world.actors].find(one => one.id === id)!;
const drawn = (world: World) =>
  world.renderSnapshot().map(state => state.actor.id);

describe('the stack of screens', () => {
  it('starts with the Main Screen, which going back never takes off', () => {
    const world = makeWorld();
    expect(world.screens()).toHaveLength(1);
    expect(world.goBack()).toBe(false);
    expect(named(world, 'Menu')).toBeDefined();
  });

  it('puts a screen on top, and going back takes it off', () => {
    const world = makeWorld();
    world.showScreen('screens/pause');
    expect(world.screens()).toHaveLength(2);
    expect(named(world, 'Resume')).toBeDefined();

    expect(world.goBack()).toBe(true);
    expect(world.screens()).toHaveLength(1);
    expect(named(world, 'Resume')).toBeUndefined();
    // …and the World is not the screen's to take.
    expect(named(world, 'Coin')).toBeDefined();
  });

  it('shows the same screen twice as two screens', () => {
    const world = makeWorld();
    world.showScreen('screens/pause');
    world.showScreen('screens/pause');
    expect(world.screens()).toHaveLength(3);
    world.goBack();
    expect(world.screens()).toHaveLength(2);
    expect(named(world, 'Resume')).toBeDefined();
  });

  it('takes off what was put up over the top screen with it', () => {
    const world = makeWorld();
    world.showScreen('screens/pause');
    world.loadMapNamed('screens/peek');
    world.goBack();
    expect(named(world, 'Score')).toBeUndefined();
    expect(world.screens()).toHaveLength(1);
  });

  it('shows nothing for a path nothing registered', () => {
    const world = makeWorld();
    expect(world.showScreen('screens/nowhere')).toEqual([]);
    expect(world.screens()).toHaveLength(1);
  });
});

describe('input on the stack', () => {
  it('reaches the top screen only', () => {
    const world = makeWorld();
    expect(world.canReach(named(world, 'Menu'))).toBe(true);
    world.showScreen('screens/pause');
    expect(world.canReach(named(world, 'Resume'))).toBe(true);
    expect(world.canReach(named(world, 'Menu'))).toBe(false);
    world.goBack();
    expect(world.canReach(named(world, 'Menu'))).toBe(true);
  });

  it('reaches the World through the top screen’s Viewports, and only then', () => {
    const world = makeWorld();
    const coin = named(world, 'Coin');
    expect(world.canReach(coin)).toBe(true);
    world.showScreen('screens/pause');
    expect(world.canReach(coin)).toBe(false);
    world.showScreen('screens/peek');
    expect(world.canReach(coin)).toBe(true);
  });

  it('reaches what was put up over the top screen', () => {
    const world = makeWorld();
    world.showScreen('screens/pause');
    world.loadMapNamed('screens/peek');
    expect(world.canReach(named(world, 'Score'))).toBe(true);
    expect(world.canReach(named(world, 'Resume'))).toBe(true);
  });
});

describe('drawing the stack', () => {
  it('does not draw a screen an opaque one covers, or the World it showed', () => {
    const world = makeWorld();
    expect(drawn(world)).toEqual(
      expect.arrayContaining(['Game', 'Menu', 'Coin']),
    );
    expect(world.spaceSnapshot().filter(space => space.owner)).toHaveLength(1);

    world.showScreen('screens/pause');
    expect(drawn(world)).not.toContain('Menu');
    expect(drawn(world)).not.toContain('Game');
    expect(drawn(world)).toContain('Resume');
    // No Viewport onto the World is drawn, so nothing draws the World.
    expect(world.spaceSnapshot().filter(space => space.owner)).toEqual([]);

    world.goBack();
    expect(drawn(world)).toContain('Menu');
  });

  it('draws what a half-clear screen shows through', () => {
    const world = makeWorld();
    world.showScreen('screens/peek');
    expect(drawn(world)).toEqual(
      expect.arrayContaining(['Game', 'Menu', 'Score', 'Mini']),
    );
  });

  it('gives each screen drawn with a color its color and first actor', () => {
    const world = makeWorld();
    expect(world.screenColors()).toEqual([]);
    world.showScreen('screens/peek');
    expect(world.screenColors()).toEqual([
      expect.objectContaining({color: [0, 0, 0, 0.5], first: 'Score'}),
    ]);
    // Covered by the pause menu, the scoreboard's color is not drawn either.
    world.showScreen('screens/pause');
    expect(world.screenColors()).toEqual([
      expect.objectContaining({color: [0, 0, 0, 1], first: 'Resume'}),
    ]);
  });
});
