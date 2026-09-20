// What the WORLD types, as against what the player types.
//
// An on-screen keyboard is a map of Buttons, and a Button's handler runs after
// every step in the frame — which is after the step that reads what was typed,
// and before the drain at the end of the tick. So a character added the
// driver's way from a handler would be cleared without ever having been read,
// silently. What is pinned here is the frame it is read in instead
// (specs/KEYBOARD_PLAN.md).

import {describe, expect, it} from 'vitest';

import {RuleBuilder} from '../builders/RuleBuilder';
import {WorldBuilder} from '../builders/WorldBuilder';

/** A world with a step in `sense` that records what each frame could read. */
const watching = () => {
  const typed: string[][] = [];
  const pressed: string[][] = [];
  const released: string[][] = [];
  const r = new RuleBuilder({id: 'watch', name: 'Watch'});
  r.addStepIn('read', 'sense', world => {
    typed.push([...world.typedCharacters()]);
    pressed.push(world.newlyPressedKeys());
    released.push(world.newlyReleasedKeys());
  });
  const world = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([r.build()])
    .instantiate();
  return {world, typed, pressed, released};
};

describe('typing from inside the world', () => {
  it('is read by the NEXT frame, not the one that asked', () => {
    const {world, typed} = watching();
    // As a click handler does it: during a tick, after the step above has
    // already run for this frame.
    world.tick(0);
    world.type('a');
    expect(typed).toEqual([[]]);

    world.tick(0);
    expect(typed[1]).toEqual(['a']);

    // …and once only. A character has no state to compare against, so a frame
    // that has read it is done with it.
    world.tick(0);
    expect(typed[2]).toEqual([]);
  });

  it('puts a string in one character at a time', () => {
    const {world, typed} = watching();
    world.type('hi');
    world.tick(0);
    expect(typed[0]).toEqual(['h', 'i']);
  });

  it('goes in front of what the driver typed in the meantime', () => {
    const {world, typed} = watching();
    world.type('a');
    // The player typed while the frame the button was clicked in was still
    // running, so the button's character happened first.
    world.addTyped(['b']);
    world.tick(0);
    expect(typed[0]).toEqual(['a', 'b']);
  });
});

describe('pressing a key from inside the world', () => {
  it('is down for exactly one frame — an edge each way', () => {
    const {world, pressed, released} = watching();
    world.pressKey('backspace');

    world.tick(0);
    expect(pressed[0]).toEqual(['backspace']);
    expect(world.isKeyDown('backspace')).toBe(true);

    world.tick(0);
    expect(pressed[1]).toEqual([]);
    expect(released[1]).toEqual(['backspace']);
    expect(world.isKeyDown('backspace')).toBe(false);
  });

  it('does not take the driver’s keys away while it is down', () => {
    const {world} = watching();
    world.setInput(['left arrow']);
    world.pressKey('enter');
    world.tick(0);
    expect(world.isKeyDown('left arrow')).toBe(true);
    expect(world.isKeyDown('enter')).toBe(true);

    world.tick(0);
    expect(world.isKeyDown('left arrow')).toBe(true);
    expect(world.isKeyDown('enter')).toBe(false);
  });
});
