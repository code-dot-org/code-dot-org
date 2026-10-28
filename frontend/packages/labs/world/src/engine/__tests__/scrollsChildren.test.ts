// A window onto its own children (`rules/scrolling`).
//
// The Scroll View's engine half, with no actor file: the content measured from
// the children, the scroll kept inside it, the children moved by it, and the
// pointer unable to reach what the window does not show
// (specs/ONE_WORLD_PLAN.md, "Clipping").

import {describe, expect, it} from 'vitest';

import {ActorBuilder} from '../builders/ActorBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';
import type {Actor} from '../core/Actor';
import {Vector} from '../core/Vector';
import {
  ContentProperty,
  ScrollProperty,
  ScrollsTrait,
} from '../rules/scrolling';
import {IntrinsicSizeProperty, PositionProperty} from '../rules/spatial';

const Row = new ActorBuilder({id: 'row', name: 'Row'}).set(
  IntrinsicSizeProperty,
  new Vector(100, 20),
);

/** A 100 by 100 window at (200, 200): its top left is (150, 150). */
const Window = new ActorBuilder({id: 'window', name: 'Window'})
  .useTraits([ScrollsTrait])
  .set(IntrinsicSizeProperty, new Vector(100, 100));

const scrolled = () => {
  const world = new WorldBuilder({id: 'w', name: 'W'}).instantiate();
  const window = Window.instantiate('Window', 'actors/window');
  world.addActor(window);
  window.set(PositionProperty, new Vector(200, 200));
  // Ten rows down a column three windows tall, each 30 below the last, the
  // first with its top at the top of the window.
  const rows: Actor[] = Array.from({length: 10}, (_, at) => {
    const row = Row.instantiate(`row${at}`, 'actors/row');
    world.addActor(row);
    row.setParent(window);
    row.set(PositionProperty, new Vector(200, 160 + at * 30));
    return row;
  });
  world.tick(1 / 60);
  return {
    world,
    window,
    rows,
    scroll: () => window.get(ScrollProperty) as {x: number; y: number},
    to: (y: number) => {
      window.set(ScrollProperty, new Vector(0, y));
      world.tick(1 / 60);
    },
    pointAt: (x: number, y: number) => world.setPointer({x, y}, []),
  };
};

describe('a window onto its own children', () => {
  it('measures what it holds from the top of the window', () => {
    // The last row's middle is 280 below the window's top, and half a row
    // past that is the bottom of the page.
    const {window} = scrolled();
    expect(window.get(ContentProperty)).toEqual({x: 100, y: 290});
  });

  it('moves its children up the page by the scroll', () => {
    const {to, rows} = scrolled();
    expect(rows[0].get(PositionProperty)).toEqual(new Vector(200, 160));
    to(120);
    expect(rows[0].get(PositionProperty)).toEqual(new Vector(200, 40));
  });

  it('stops at the end, and says where it stopped', () => {
    // A page 290 tall and a window 100: the last place the top can be is 190.
    const {to, scroll} = scrolled();
    to(10_000);
    expect(scroll()).toEqual({x: 0, y: 190});
  });

  it('stops at the top, however far back it is pushed', () => {
    const {to, scroll} = scrolled();
    to(-500);
    expect(scroll()).toEqual({x: 0, y: 0});
  });

  it('does not scroll an axis the window already covers', () => {
    const {window, world, scroll} = scrolled();
    window.set(ScrollProperty, new Vector(80, 0));
    world.tick(1 / 60);
    expect(scroll().x).toBe(0);
  });

  it('keeps a child where it was put when it is moved while scrolled', () => {
    // A world position written to a child goes through the scrolled frame,
    // so it reads back as what was written.
    const {to, rows} = scrolled();
    to(60);
    rows[3].set(PositionProperty, new Vector(210, 180));
    expect(rows[3].get(PositionProperty)).toEqual(new Vector(210, 180));
  });

  it('shows a child to the pointer only inside the window', () => {
    // Row 5 is at y 310, below the window, until the page is scrolled.
    const {world, rows, to, pointAt} = scrolled();
    pointAt(200, 310);
    expect(world.showsAtPointer(rows[5])).toBe(false);
    to(150);
    pointAt(200, 160);
    expect(rows[5].get(PositionProperty)).toEqual(new Vector(200, 160));
    expect(world.showsAtPointer(rows[5])).toBe(true);
    // The window itself is nobody's child, and shows wherever it is.
    expect(world.showsAtPointer(world.actors.ofType('actors/window')[0])).toBe(
      true,
    );
  });

  it('tells the driver its window, and each child where it is drawn', () => {
    const {world, window, rows, to} = scrolled();
    to(60);
    const states = world.renderSnapshot();
    const own = states.find(state => state.actor === window)!;
    expect(own.clip).toEqual({width: 100, height: 100});
    const first = states.find(state => state.actor === rows[0])!;
    // Stored 40 above the window's middle, and drawn 60 further up.
    expect(first.local).toMatchObject({x: 0, y: -100});
  });
});
