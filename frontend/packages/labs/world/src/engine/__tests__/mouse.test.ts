// The mouse, as the World owns it.
//
// The keyboard's counterpart (see `keyboard.test`), and the same division: the
// driver reads the real pointer and hands its state to the World each frame
// (`setPointer`), the World adds the FRAME BOUNDARY, and `rules/stock/mouse`
// turns the edges into events.
//
// One thing has no keyboard counterpart. A pointer is SOMEWHERE, and where it
// is arrives in the driver's coordinates — pixels down and across the window
// onto the world. The place it is over is a different number as soon as the
// camera moves, and turning one into the other is the World's job because the
// camera is the World's.

import {describe, expect, it} from 'vitest';

import {VIEWPORT_HEIGHT, VIEWPORT_WIDTH} from '../core/viewport';
import {Vector, WorldBuilder} from '../index';

const makeWorld = () => new WorldBuilder({id: 'w', name: 'W'}).getWorld();

/** The middle of the window, which is where a resting camera is looking. */
const CENTRE = {x: VIEWPORT_WIDTH / 2, y: VIEWPORT_HEIGHT / 2};

describe('the World’s mouse', () => {
  it('reports which buttons are held right now', () => {
    const world = makeWorld();
    world.setPointer(CENTRE, ['left', 'right']);
    expect(world.isButtonDown('left')).toBe(true);
    expect(world.isButtonDown('right')).toBe(true);
    expect(world.isButtonDown('middle')).toBe(false);
  });

  it('reports the edges once, not for every frame a button is held', () => {
    const world = makeWorld();
    world.setPointer(CENTRE, ['left']);
    expect(world.newlyPressedButtons()).toEqual(['left']);
    expect(world.newlyReleasedButtons()).toEqual([]);

    // Held, not clicked again — which is the whole reason the World keeps the
    // previous frame's set: a rule polling `is down` cannot tell the two apart.
    world.tick(0.1);
    world.setPointer(CENTRE, ['left']);
    expect(world.newlyPressedButtons()).toEqual([]);
    expect(world.newlyReleasedButtons()).toEqual([]);

    world.tick(0.1);
    world.setPointer(CENTRE, []);
    expect(world.newlyPressedButtons()).toEqual([]);
    expect(world.newlyReleasedButtons()).toEqual(['left']);

    world.tick(0.1);
    world.setPointer(CENTRE, []);
    expect(world.newlyReleasedButtons()).toEqual([]);
  });

  it('tracks the buttons independently of the keys', () => {
    // Two sets, advanced in the same breath but never mixed: a game that reads
    // "was space pressed" must not hear a click.
    const world = makeWorld();
    world.setInput([' ']);
    world.setPointer(CENTRE, ['left']);

    expect(world.newlyPressedKeys()).toEqual([' ']);
    expect(world.newlyPressedButtons()).toEqual(['left']);

    world.tick(0.1);
    world.setInput([' ']);
    world.setPointer(CENTRE, []);
    expect(world.newlyPressedKeys()).toEqual([]);
    expect(world.newlyReleasedKeys()).toEqual([]);
    expect(world.newlyReleasedButtons()).toEqual(['left']);
  });

  it('is over the middle of the world when the camera has not moved', () => {
    // A camera's position is the point it shows at the MIDDLE of the view
    // (core/Camera), and it rests at the middle of the world's own rectangle.
    const world = makeWorld();
    world.setPointer(CENTRE, []);
    expect(world.mousePosition().equals(world.activeCamera().position)).toBe(
      true,
    );
  });

  it('is over the corner the pointer is in, not the corner of the screen', () => {
    const world = makeWorld();
    const camera = world.activeCamera();
    camera.position = new Vector(2000, 800);
    world.setPointer({x: 0, y: 0}, []);

    // Top left of the WINDOW is half a view up and left of what the camera is
    // looking at — so a camera two screens along puts the pointer two screens
    // along, which is the whole point of converting here.
    expect(
      world
        .mousePosition()
        .equals({x: 2000 - VIEWPORT_WIDTH / 2, y: 800 - VIEWPORT_HEIGHT / 2}),
    ).toBe(true);
  });

  it('starts somewhere rather than nowhere', () => {
    // Nothing has moved the mouse yet, and a rule that asks still gets a point:
    // the driver reports a position every frame, but the first frame's rules
    // run against whatever was there before the first report.
    const world = makeWorld();
    expect(world.mousePosition()).toBeInstanceOf(Vector);
  });
});
