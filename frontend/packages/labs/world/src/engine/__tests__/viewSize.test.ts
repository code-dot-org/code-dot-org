// How much of the world is on screen at once: the Main Screen's size, which
// its module says before the game starts, and which is fixed once it has.

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

  it('is fixed once the game has run a frame', () => {
    // Every screen, anchor and layout is arranged against it, and a screen
    // that changed size under them would be a game rearranging itself.
    const builder = new WorldBuilder({id: 'w', name: 'w'});
    const world = builder.getWorld();
    world.setViewSize(26, 16);
    world.tick(1 / 60);

    expect(() => world.setViewSize(10, 10)).toThrow(/Main Screen/);
    expect(world.viewSize().x).toBe(26 * 32);
  });
});
