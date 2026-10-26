// Scrolling a window over something bigger than it.
//
// The pieces were all there — a Viewport clips with a camera of its own, a
// space grows to fit the map loaded into it, and `settleSpace` clamps the
// camera into those bounds every tick. What was missing was a way to SAY
// where it is scrolled to, in the units a list is scrolled in rather than the
// camera's middle (specs/SCROLLING_PLAN.md).

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import {Vector} from '../core/Vector';
import type {WorldMap} from '../core/World';
import {IntrinsicSizeProperty, PositionProperty} from '../rules/spatial';
import {
  ViewportContentProperty,
  ViewportScrollProperty,
  ViewportTrait,
} from '../rules/viewport';

const Row = new ActorBuilder({id: 'row', name: 'Row'}).set(
  IntrinsicSizeProperty,
  new Vector(100, 20),
);

/** A 100 by 100 window — small enough that everything below overflows it. */
const Window = new ActorBuilder({id: 'window', name: 'Window'})
  .useTraits([ViewportTrait])
  .set(IntrinsicSizeProperty, new Vector(100, 100));

/** Ten rows down a column 100 wide and 300 tall: three windows' worth. */
const LONG: WorldMap = {
  size: {width: 1, height: 3},
  tile: {width: 100, height: 100},
  actors: Array.from({length: 10}, (_, at) => ({
    type: 'actors/row',
    id: `row${at}`,
    properties: {positional: {position: {x: 50, y: 15 + at * 30}}},
  })),
};

const scrolled = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
  world.define('actors/row', Row);
  const window = Window.instantiate('Window', 'actors/window');
  world.addActor(window);
  world.set(PositionProperty as never, new Vector(0, 0) as never);
  world.loadMapInto(window, LONG);
  world.tick(1 / 60);
  const space = world.viewportSpaceOf(window)!;
  return {
    world,
    window,
    space,
    scroll: () => window.get(ViewportScrollProperty) as {x: number; y: number},
    to: (y: number) => {
      window.set(ViewportScrollProperty, new Vector(0, y));
      world.tick(1 / 60);
    },
  };
};

describe('a window onto something taller than itself', () => {
  it('knows how big the thing is', () => {
    const {window, space} = scrolled();
    // The space grew to the map, which is what there is to scroll over.
    expect(space.bounds).toEqual(new Vector(100, 300));
    expect(window.get(ViewportContentProperty)).toEqual({x: 100, y: 300});
  });

  it('starts at the top, not at the middle', () => {
    // The camera is a MIDDLE and a scroll is a top-left, which is the whole
    // reason `scroll` is its own property: zero has to mean the top.
    const {scroll, space} = scrolled();
    expect(scroll()).toEqual({x: 0, y: 0});
    expect(space.camera!.position.y).toBe(50);
  });

  it('moves the camera by what it was scrolled', () => {
    const {to, space} = scrolled();
    to(120);
    expect(space.camera!.position.y).toBe(170);
  });

  it('stops at the end, and says where it stopped', () => {
    // Three windows of content and one window of view: the last place the top
    // of the window can be is 200. A project that asks for more is told the
    // truth, or a scrollbar drawn from it runs off its track.
    const {to, scroll} = scrolled();
    to(10_000);
    expect(scroll()).toEqual({x: 0, y: 200});
  });

  it('stops at the top, however far back it is pushed', () => {
    const {to, scroll} = scrolled();
    to(-500);
    expect(scroll()).toEqual({x: 0, y: 0});
  });

  it('does not scroll an axis the window already covers', () => {
    // The content is exactly as wide as the window, so there is nowhere
    // sideways to go and asking says so.
    const {window, world, scroll} = scrolled();
    window.set(ViewportScrollProperty, new Vector(80, 0));
    world.tick(1 / 60);
    expect(scroll().x).toBe(0);
  });
});
