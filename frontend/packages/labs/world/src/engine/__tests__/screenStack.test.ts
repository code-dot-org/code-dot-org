// Screens as a stack over the one World (specs/SCREEN_STACK_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {GameEvent, Property} from '../core/types';
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

describe('what a screen holds of its own', () => {
  // specs/SCREEN_STACK_PLAN.md, step 3: a screen's words are its copy's.
  const VOLUME: Property<number> = {
    id: 'volume',
    type: 'number',
    default: 5,
    readonly: false,
    scope: 'world',
    ownerId: 'screens/settings',
    ownerKind: 'world',
  };
  const CHANGED: GameEvent = {id: 'changed', ownerId: 'screens/settings'};
  const SETTINGS: WorldMap = {
    values: [VOLUME as Property<unknown>],
    actors: [at('actors/panel', 'Slider')],
  };
  const withSettings = () => {
    const world = makeWorld();
    world.defineMap('screens/settings', SETTINGS);
    return world;
  };
  const shown = (world: World) => {
    world.showScreen('screens/settings');
    return world.screens().at(-1)!;
  };

  it('is a copy for each time it is shown, from its defaults', () => {
    const world = withSettings();
    const first = shown(world);
    first.set(VOLUME, 9);
    const second = shown(world);
    expect(second.get(VOLUME)).toBe(5);
    expect(first.get(VOLUME)).toBe(9);
    // Taken off and shown again, it starts over.
    world.goBack();
    world.goBack();
    expect(shown(world).get(VOLUME)).toBe(5);
  });

  it('is nothing the Main Screen holds', () => {
    const world = withSettings();
    expect(() => world.screens()[0].get(VOLUME)).toThrow(/no value 'volume'/);
  });

  it('hears its own events, in that copy alone, after the tick', () => {
    const world = withSettings();
    const heard: string[] = [];
    const first = shown(world);
    const second = shown(world);
    first.on(CHANGED, (_world, value) => heard.push(`first ${value}`));
    second.on(CHANGED, (_world, value) => heard.push(`second ${value}`));

    first.emit(CHANGED, 'loud');
    expect(heard).toEqual([]);
    world.tick(1 / 60);
    expect(heard).toEqual(['first loud']);
  });

  it('hears nothing once it is taken off', () => {
    const world = withSettings();
    const heard: unknown[] = [];
    const screen = shown(world);
    screen.on(CHANGED, () => heard.push('heard'));
    screen.emit(CHANGED);
    world.goBack();
    world.tick(1 / 60);
    expect(heard).toEqual([]);
  });
});

describe('the Main Screen’s values, by name', () => {
  it('are read and set from anywhere without importing it', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const score = builder.defineProperty('score', 'number', 0, {name: 'score'});
    const world = builder.instantiate();

    expect(world.valueNamed('score')).toBe(0);
    expect(world.setValueNamed('score', 3)).toBe(true);
    expect(world.get(score)).toBe(3);
    expect(world.valueNamed('lives')).toBeUndefined();
    expect(world.setValueNamed('lives', 1)).toBe(false);
  });
});
