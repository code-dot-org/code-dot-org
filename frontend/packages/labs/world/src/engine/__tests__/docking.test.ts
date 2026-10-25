// Docked placements filling their regions of the window
// (specs/DOCKING_PLAN.md, step 2).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {Vector} from '../core/Vector';
import type {World, WorldMap} from '../core/World';
import {
  BoxedRule,
  HasABoxTrait,
  HeightProperty,
  WidthProperty,
} from '../rules/boxed';
import {IntrinsicSizeProperty, PositionProperty} from '../rules/spatial';
import {ViewportTrait} from '../rules/viewport';

/** Boxed and drawn at its box, as every interface actor is. */
const boxed = (id: string, traits = [HasABoxTrait]) =>
  new ActorBuilder({id, name: id}).useTraits(traits).defineDrawing(
    actor => Number(actor.get(WidthProperty)),
    actor => Number(actor.get(HeightProperty)),
    () => {},
  );

const Panel = boxed('panel');
const Window = boxed('window', [HasABoxTrait, ViewportTrait]);

const makeWorld = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([BoxedRule])
    .instantiate();
  world.define('actors/panel', Panel);
  world.define('actors/window', Window);
  return world;
};

/** A screen of one HUD bar over a Viewport, both drawn small in the map. */
const SCREEN: WorldMap = {
  size: {width: 10, height: 10},
  tile: {width: 32, height: 32},
  layout: {
    split: 'down',
    fixed: 'first',
    size: 40,
    first: {dock: 'hud'},
    second: {dock: 'game'},
  },
  actors: [
    {
      type: 'actors/panel',
      id: 'hud',
      properties: {
        positional: {position: {x: 50, y: 50}},
        hasABox: {width: 20, height: 20},
      },
    },
    {
      type: 'actors/window',
      id: 'game',
      properties: {
        positional: {position: {x: 100, y: 100}},
        hasABox: {width: 30, height: 30},
      },
    },
    {
      type: 'actors/panel',
      id: 'floating',
      properties: {
        positional: {position: {x: 7, y: 9}},
        hasABox: {width: 5, height: 5},
      },
    },
  ],
};

const named = (world: World, id: string) =>
  [...world.actors].find(one => one.id === id)!;

const box = (world: World, id: string) => {
  const actor = named(world, id);
  return {
    at: actor.get(PositionProperty),
    width: actor.get(WidthProperty),
    height: actor.get(HeightProperty),
  };
};

describe('a docked placement', () => {
  it('fills its region of the window, middle and box', () => {
    const world = makeWorld();
    world.loadMap(SCREEN);

    // The default window: 320 by 320.
    expect(box(world, 'hud')).toEqual({
      at: new Vector(160, 20),
      width: 320,
      height: 40,
    });
    expect(box(world, 'game')).toEqual({
      at: new Vector(160, 180),
      width: 320,
      height: 280,
    });
    // …and is drawn that size from the moment it is placed.
    expect(named(world, 'hud').get(IntrinsicSizeProperty)).toEqual(
      new Vector(320, 40),
    );
  });

  it('leaves one in no region where the map put it', () => {
    const world = makeWorld();
    world.loadMap(SCREEN);
    expect(box(world, 'floating')).toEqual({
      at: new Vector(7, 9),
      width: 5,
      height: 5,
    });
  });

  it('follows a window resized after the map loaded', () => {
    const world = makeWorld();
    world.loadMap(SCREEN);

    world.setViewSize(20, 15);

    // 640 by 480: the bar the same height, the game the rest.
    expect(box(world, 'hud')).toMatchObject({width: 640, height: 40});
    expect(box(world, 'game')).toEqual({
      at: new Vector(320, 260),
      width: 640,
      height: 440,
    });
  });

  it('gives a docked Viewport a window, and a space, its region’s size', () => {
    const world = makeWorld();
    world.loadMap(SCREEN);
    const space = world.viewportSpaceOf(named(world, 'game'))!;

    // What the Viewport's own camera sees through.
    expect(world.viewSize(space.camera!)).toEqual(new Vector(320, 280));
    expect(space.bounds.x).toBeGreaterThanOrEqual(320);
    expect(space.bounds.y).toBeGreaterThanOrEqual(280);
    // Its camera, at rest, in the middle of the window it has now.
    expect(space.camera!.position).toEqual(new Vector(160, 140));
  });

  it('closes over one that has gone, the rest taking its region', () => {
    const world = makeWorld();
    world.loadMap(SCREEN);
    world.removeActor(named(world, 'hud'));

    world.setViewSize(10, 10);

    expect(box(world, 'game')).toEqual({
      at: new Vector(160, 160),
      width: 320,
      height: 320,
    });
  });
});
