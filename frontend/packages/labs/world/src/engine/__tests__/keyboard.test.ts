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

// WHICH KEYS THE GAME MAY TAKE FROM THE BROWSER.
//
// The browser has its own use for some of them — space and the arrows scroll,
// Tab moves to the next thing on the page — and which ones a game needs is a
// fact about the game rather than a constant in the driver. Tab is the case
// that could not be a constant: an interface actor holding the focus wants it,
// and a game with nothing focused must not have it (specs/UI_ACTORS.md).
describe('the keys a world claims', () => {
  it('holds what it asked for, and gives it back', () => {
    const world = makeWorld();

    world.captureKey('tab');
    expect([...world.capturedKeys()]).toEqual(['tab']);

    world.releaseKey('tab');
    expect([...world.capturedKeys()]).toEqual([]);
  });

  it('refuses Escape, however it is asked', () => {
    // THE DOOR, and it is not the game's to shut. Escape is what drops the
    // focus and hands Tab back to the page, so a game that could capture it
    // could make the canvas a place a keyboard user cannot leave. Refused
    // here rather than trusted to every rule that will ever be written
    // (`core/keys`, RESERVED_KEYS).
    const world = makeWorld();

    world.captureKey('escape');

    expect([...world.capturedKeys()]).toEqual([]);
  });

  it('reports taking the keyboard for exactly the frame it happened', () => {
    // A moment, not a state. Arriving at the game and pressing a key in it are
    // told apart by this and by nothing else — the Tab that carried the player
    // here was pressed while the page still had the keyboard.
    const world = makeWorld();
    expect(world.keyboardJustArrived()).toBe(false);

    world.gainedKeyboard();
    expect(world.keyboardJustArrived()).toBe(true);

    world.tick(1 / 60);
    expect(world.keyboardJustArrived()).toBe(false);
  });
});
