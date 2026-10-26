// Sound: a moment and a state (specs/SOUND.md).
//
// `play sound` is the first thing this engine has had to say HAPPENED.
// Everything else crossing the boundary is state the driver reads once a frame,
// so a one-shot needed a channel of its own — a queue the driver drains after
// each tick — and the two halves are tested for opposite properties: the moment
// must not survive into the hot-reload baseline, and the track must.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder, type World} from '..';

const built = (): World => new WorldBuilder({id: 'w', name: 'W'}).instantiate();

describe('a one-shot sound', () => {
  it('is queued, not played', () => {
    const world = built();

    world.playSound('pop');

    expect(world.drainSounds()).toEqual(['pop']);
  });

  it('empties on the drain, so the next frame is silent', () => {
    const world = built();
    world.playSound('pop');
    world.drainSounds();

    expect(world.drainSounds()).toEqual([]);
  });

  it('keeps repeats', () => {
    // Two coins collected in one tick are two pops. A queue that deduplicated
    // would make a busy frame quieter than a calm one.
    const world = built();

    world.playSound('pop');
    world.playSound('pop');

    expect(world.drainSounds()).toEqual(['pop', 'pop']);
  });

  it('keeps the order they were raised in', () => {
    const world = built();

    world.playSound('jump');
    world.playSound('land');

    expect(world.drainSounds()).toEqual(['jump', 'land']);
  });

  it('is not in the snapshot', () => {
    // The point, and the reason this is a queue rather than a property. A
    // moment in the hot-reload baseline would be compared, found different and
    // replayed — which is exactly the mistake an actor's TRAITS made in the
    // other direction, by being state the baseline left out.
    const world = built();
    const before = JSON.stringify(world.snapshot());

    world.playSound('pop');

    expect(JSON.stringify(world.snapshot())).toBe(before);
  });
});

describe('a world built to be looked at', () => {
  it('drops the sounds its module raised', () => {
    // `reconcile` builds an `incoming` world by running the module top-level,
    // and the thumbnail manifest builds a throwaway per picker refresh. A
    // `play sound` at setup goes to the world that gets built and to nothing
    // else: the builder does not log it, so replaying the description is
    // silent.
    const description = new WorldBuilder({id: 'w', name: 'W'});
    description.playSound('fanfare');

    const replayed = description.instantiate();

    expect(replayed.drainSounds()).toEqual([]);
    // …while the world the module actually built has it, once.
    expect(description.getWorld().drainSounds()).toEqual(['fanfare']);
  });

  it('does not accumulate one per rebuild', () => {
    // The failure this prevents: a logged one-shot sounds again every time the
    // picker refreshes, and a project with three actors refreshes a lot.
    const description = new WorldBuilder({id: 'w', name: 'W'});
    description.playSound('fanfare');

    expect(description.instantiate().drainSounds()).toEqual([]);
    expect(description.instantiate().drainSounds()).toEqual([]);
  });
});

describe('music', () => {
  it('is what is playing, and is state', () => {
    const world = built();

    world.setMusic('theme');

    expect(world.music()).toBe('theme');
    expect(world.snapshot().music).toBe('theme');
  });

  it('replaces rather than layering', () => {
    // A world plays one track. Two would need a mixer, and nothing has asked.
    const world = built();

    world.setMusic('theme');
    world.setMusic('boss');

    expect(world.music()).toBe('boss');
  });

  it('stops on nothing, which is how it stops', () => {
    const world = built();
    world.setMusic('theme');

    world.setMusic(undefined);

    expect(world.music()).toBeUndefined();
    expect(world.snapshot().music).toBeUndefined();
  });

  it('is absent from a silent world rather than present and empty', () => {
    // The snapshot is compared by stringifying it, so a key that is sometimes
    // `undefined` and sometimes missing would be two spellings of silence.
    expect('music' in built().snapshot()).toBe(false);
  });

  it('survives being replayed into another world', () => {
    // The other half of the one-shot's rule: what is PLAYING is part of the
    // description, so a world rebuilt from it is playing the same thing.
    const description = new WorldBuilder({id: 'w', name: 'W'});
    description.setMusic('theme');

    expect(description.instantiate().music()).toBe('theme');
  });

  it('is collapsed in the log, so a track set every tick does not grow it', () => {
    // `set` makes the same bargain for the same reason: one value, last write
    // wins, and a handler that sets it on a timer would otherwise grow the
    // description by one entry per frame for the life of the game.
    const description = new WorldBuilder({id: 'w', name: 'W'});
    for (let n = 0; n < 100; n++) {
      description.setMusic(`track${n}`);
    }

    expect(description.instantiate().music()).toBe('track99');
  });
});

describe('sound and the rest of the world', () => {
  it('leaves everything else in the snapshot alone', () => {
    // A guard on the snapshot's shape rather than on sound: `music` is a new
    // key in a structure the reconciler compares by stringifying, so the test
    // that it changes nothing else is worth its two lines.
    const world = built();
    world.addActor(new ActorBuilder({id: 'a', name: 'A'}).instantiate('a'));
    const before = world.snapshot();

    world.setMusic('theme');
    const after = world.snapshot();

    expect({...after, music: undefined}).toEqual({...before, music: undefined});
  });
});
