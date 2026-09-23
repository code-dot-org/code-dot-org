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
import {KEY_REPEAT_DELAY, KEY_REPEAT_INTERVAL} from '../core/keys';

const makeWorld = () => new WorldBuilder({id: 'w', name: 'W'}).getWorld();

describe('a key held down', () => {
  /** Hold `keys` for `seconds`, and count the ticks that said "again". */
  const holdFor = (seconds: number, step = 1 / 60) => {
    const world = makeWorld();
    const fired: number[] = [];
    let at = 0;
    for (; at < seconds; at += step) {
      world.setInput([' ']);
      world.tick(step);
      if (world.repeatingKeys().includes(' ')) {
        fired.push(Number((at + step).toFixed(3)));
      }
    }
    return fired;
  };

  it('does not repeat before the delay is up', () => {
    // A tap must be one of whatever it does. `presses` is the first fire and
    // this is only what comes after it, so nothing at all for the first
    // four-tenths of a second (`KEY_REPEAT_DELAY`).
    expect(holdFor(KEY_REPEAT_DELAY - 0.02)).toEqual([]);
  });

  it('repeats at the interval once the delay is up, not every frame', () => {
    // A second of holding at sixty frames: about ten repeats, not sixty. The
    // exact count is quantised by the frame — a 0.06 interval lands every
    // third or fourth frame — so what is pinned is the rate, not the instant.
    const fired = holdFor(1);
    const earned = (1 - KEY_REPEAT_DELAY) / KEY_REPEAT_INTERVAL;
    expect(fired.length).toBeGreaterThan(earned - 2);
    expect(fired.length).toBeLessThan(earned + 2);
    expect(fired[0]).toBeGreaterThanOrEqual(KEY_REPEAT_DELAY);
  });

  it('fires ONCE for a long frame, and does not then spray', () => {
    // A dropped frame worth ten repeats is one repeat, not ten: this answers a
    // SET of keys, so a tick can only say "again" once however long it was.
    // That is the behaviour worth having — a stutter should not send a list
    // ten rows down.
    //
    // And the count resyncs rather than falling behind: the repeats that long
    // frame earned are marked as fired, so the frame after it is quiet. The
    // first tick is the key going DOWN, which starts the clock and fires
    // nothing, because the press itself is what `presses` already raised.
    const world = makeWorld();
    world.setInput([' ']);
    world.tick(1 / 60);
    expect(world.repeatingKeys()).toEqual([]);

    world.setInput([' ']);
    world.tick(KEY_REPEAT_DELAY + KEY_REPEAT_INTERVAL * 10.5);
    expect(world.repeatingKeys()).toEqual([' ']);

    world.setInput([' ']);
    world.tick(1 / 60);
    expect(world.repeatingKeys()).toEqual([]);
  });

  it('starts the delay again after the key is let go', () => {
    const world = makeWorld();
    world.setInput([' ']);
    world.tick(1 / 60);
    world.setInput([' ']);
    world.tick(KEY_REPEAT_DELAY + KEY_REPEAT_INTERVAL);
    expect(world.repeatingKeys()).toEqual([' ']);

    world.setInput([]);
    world.tick(1 / 60);
    world.setInput([' ']);
    world.tick(1 / 60);
    world.setInput([' ']);
    world.tick(KEY_REPEAT_INTERVAL * 2);
    // Pressed again, so it waits out the delay afresh rather than carrying on
    // at speed.
    expect(world.repeatingKeys()).toEqual([]);
  });

  it('is nothing for a key nobody is holding', () => {
    const world = makeWorld();
    world.setInput([]);
    world.tick(1);
    expect(world.repeatingKeys()).toEqual([]);
  });
});

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
