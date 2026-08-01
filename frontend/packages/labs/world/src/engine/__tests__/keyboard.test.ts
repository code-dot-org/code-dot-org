// The keyboard, as the World owns it.
//
// The engine is DOM-free: the driver reads the real keyboard and hands the
// pressed keys to the World each frame (`setInput`). What the World adds is the
// FRAME BOUNDARY — which keys went down or came up since the last tick — and
// that is the one thing about input a rule cannot work out for itself, since a
// rule holding only "is it down now?" cannot tell a press from a hold. The
// boundary is the TICK, not the call to `setInput`: the driver may set the keys
// more than once between frames, and an edge means "since the world last ran".
//
// Everything built on top of this is authored: `rules/stock/input` turns these
// edges into events, and `rules/stock/arrows` polls `isKeyDown` to walk.

import {describe, expect, it} from 'vitest';

import {WorldBuilder} from '../index';

const makeWorld = () => new WorldBuilder({id: 'w', name: 'W'}).getWorld();

describe('the World’s keyboard', () => {
  it('reports what is held right now', () => {
    const world = makeWorld();
    world.setInput([' ', 'ArrowRight']);
    expect(world.isKeyDown(' ')).toBe(true);
    expect(world.isKeyDown('ArrowRight')).toBe(true);
    expect(world.isKeyDown('ArrowLeft')).toBe(false);
  });

  it('reports the edges once, not for every frame a key is held', () => {
    const world = makeWorld();
    world.setInput([' ']);
    expect(world.newlyPressedKeys()).toEqual([' ']);
    expect(world.newlyReleasedKeys()).toEqual([]);

    // Held, not pressed again.
    world.tick(0.1);
    world.setInput([' ']);
    expect(world.newlyPressedKeys()).toEqual([]);
    expect(world.newlyReleasedKeys()).toEqual([]);

    world.tick(0.1);
    world.setInput([]);
    expect(world.newlyPressedKeys()).toEqual([]);
    expect(world.newlyReleasedKeys()).toEqual([' ']);

    // And nothing lingers into the frame after that.
    world.tick(0.1);
    world.setInput([]);
    expect(world.newlyReleasedKeys()).toEqual([]);
  });

  it('tracks several keys independently', () => {
    const world = makeWorld();
    world.setInput(['ArrowLeft']);
    world.tick(0.1);
    world.setInput(['ArrowLeft', 'ArrowUp']);
    expect(world.newlyPressedKeys()).toEqual(['ArrowUp']);
    world.tick(0.1);
    world.setInput(['ArrowUp']);
    expect(world.newlyReleasedKeys()).toEqual(['ArrowLeft']);
    expect(world.isKeyDown('ArrowUp')).toBe(true);
  });
});
