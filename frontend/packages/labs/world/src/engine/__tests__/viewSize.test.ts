// How much of the world is on screen at once.
//
// It was a constant — ten tiles square — and every camera rule was written
// against it. A world states it now, because the other kind of level is a room
// meant to be taken in at a glance, and a camera panning over one of those
// hides the puzzle rather than following the action.

import {describe, expect, it} from 'vitest';

import {WorldBuilder} from '../builders/WorldBuilder';
import {Vector} from '../core/Vector';

describe('a world that says how much of it is on screen', () => {
  it('answers in pixels, and moves a resting camera to the new middle', () => {
    // TILES in, pixels out, for the reason `setMapSize` gives: a level is
    // authored in tiles and read in pixels.
    const builder = new WorldBuilder({id: 'w', name: 'w'});
    const world = builder.getWorld();
    expect(world.viewSize().x).toBe(320);
    expect(world.cameraSnapshot()[0].position.x).toBe(160);

    builder.setViewSize(26, 16);

    expect(world.viewSize().x).toBe(26 * 32);
    expect(world.viewSize().y).toBe(16 * 32);
    expect(world.cameraSnapshot()[0].position.x).toBe((26 * 32) / 2);
    expect(world.cameraSnapshot()[0].position.y).toBe((16 * 32) / 2);
  });

  it('leaves a camera that has been moved where it was put', () => {
    // A world that says this while it is being described is framing a level;
    // a camera something has already aimed — a block, or Camera Follow — is
    // not resting, and moving it would be the view jumping for no reason.
    const builder = new WorldBuilder({id: 'w', name: 'w'});
    const world = builder.getWorld();
    world.setCameraPosition(new Vector(40, 40));

    builder.setViewSize(26, 16);

    expect(world.cameraSnapshot()[0].position.x).toBe(40);
  });

  it('replays into a world rebuilt from the description', () => {
    // Deferred like every other statement about the world: a size lost on the
    // next rebuild would be a level that fits the screen until it is reloaded.
    const builder = new WorldBuilder({id: 'w', name: 'w'});
    builder.setViewSize(26, 16);

    expect(builder.instantiate().viewSize().x).toBe(26 * 32);
  });
});
