import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  AnimationEndedEvent,
  AnimationProperty,
  AnimationRule,
  AppearanceTrait,
  FrameChangedEvent,
  FrameProperty,
  IntrinsicSizeProperty,
  PositionProperty,
  SpriteProperty,
  Vector,
  WorldBuilder,
  playAnimation,
  type AnimationDef,
} from '../index';

/**
 * A six-frame strip, the way a project's own `.anim` file describes one.
 *
 * The engine ships no animations — they are files a project holds — so a test
 * about timing brings its own, exactly as a learner's project would: frames that
 * name an image and a rectangle in it.
 */
const CELL = 32;
const coinSpin: AnimationDef = {
  name: 'Coin Spin',
  loop: true,
  frames: Array.from({length: 6}, (_unused, index) => ({
    sprite: 'coinSpin.png',
    position: {x: index * CELL, y: 0, width: CELL, height: CELL},
    delay: 1000 / 12,
  })),
};
const playerWalk: AnimationDef = {
  name: 'Player Walk',
  loop: true,
  frames: Array.from({length: 4}, (_unused, index) => ({
    sprite: 'playerWalk.png',
    position: {x: index * CELL, y: 0, width: CELL, height: CELL},
    delay: 1000 / 8,
  })),
};

// A world with the Animation rule and one actor that has the appearance trait.
function makeWorld(animation = '') {
  const builder = new WorldBuilder({id: 'w', name: 'W'})
    .useRules([AnimationRule])
    .useAnimations({coinSpin, playerWalk});
  const world = builder.getWorld();
  const actor = builder.addActor(
    new ActorBuilder({id: 'a', name: 'A'})
      .useTraits([AppearanceTrait])
      .set(PositionProperty, new Vector(0, 0))
      .set(AnimationProperty, animation),
  );
  return {world, actor};
}

describe('the Animation rule', () => {
  it('advances the frame by each frame delay, looping', () => {
    // Stock "coinSpin": 6 frames at 12 fps → 1000/12 ≈ 83.33 ms per frame.
    const {world, actor} = makeWorld('coinSpin');
    expect(actor.get(FrameProperty)).toBe(0);
    world.tick(0.1); // 100ms → past frame 0's ~83ms, into frame 1
    expect(actor.get(FrameProperty)).toBe(1);
    world.tick(0.1); // +100ms → frame 2 (with carryover)
    expect(actor.get(FrameProperty)).toBe(2);
    // Run well past the end; a looping animation wraps, never exceeds the count.
    for (let i = 0; i < 20; i++) {
      world.tick(0.1);
    }
    expect(actor.get(FrameProperty)).toBeLessThan(6);
    expect(actor.get(FrameProperty)).toBeGreaterThanOrEqual(0);
  });

  it('publishes the animation frame-cell size as the actor intrinsic size', () => {
    // "coinSpin" is a 32px uniform strip; the Collision rule reads this to fit
    // its default box to the sprite.
    const {world, actor} = makeWorld('coinSpin');
    // Unknown until the first tick resolves the animation.
    expect(actor.get(IntrinsicSizeProperty).equals({x: 0, y: 0})).toBe(true);
    world.tick(0.01);
    expect(actor.get(IntrinsicSizeProperty).equals({x: 32, y: 32})).toBe(true);
  });

  it('leaves the intrinsic size unknown for a whole-image sprite (no cell)', () => {
    // A frame without a `position` cell carries no pixel dimensions the engine
    // can know, so the intrinsic size stays (0, 0) and Collision falls back.
    const wholeImage: AnimationDef = {
      frames: [{sprite: 's', delay: 100}],
    };
    const builder = new WorldBuilder({id: 'ww', name: 'WW'})
      .useRules([AnimationRule])
      .useAnimations({wholeImage});
    const world = builder.getWorld();
    const actor = builder.addActor(
      new ActorBuilder({id: 'aw', name: 'AW'})
        .useTraits([AppearanceTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(AnimationProperty, 'wholeImage'),
    );
    world.tick(0.01);
    expect(actor.get(IntrinsicSizeProperty).equals({x: 0, y: 0})).toBe(true);
  });

  it('holds the last frame and emits AnimationEnded once when a non-looping animation finishes', () => {
    const oneShot: AnimationDef = {
      loop: false,
      frames: [
        {sprite: 's', delay: 100},
        {sprite: 's', delay: 100},
      ],
    };
    const builder = new WorldBuilder({id: 'w2', name: 'W2'})
      .useRules([AnimationRule])
      .useAnimations({oneShot});
    const world = builder.getWorld();
    const actor = builder.addActor(
      new ActorBuilder({id: 'a2', name: 'A2'})
        .useTraits([AppearanceTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(AnimationProperty, 'oneShot'),
    );

    let ends = 0;
    actor.on(AnimationEndedEvent, () => {
      ends += 1;
    });
    // 2 frames × 100ms = 200ms of animation; run well past it.
    for (let i = 0; i < 10; i++) {
      world.tick(0.1);
    }
    expect(actor.get(FrameProperty)).toBe(1); // holds the last frame
    expect(ends).toBe(1); // fires exactly once
  });

  it('restarts a finished non-looping animation when it is replayed', () => {
    const oneShot: AnimationDef = {
      loop: false,
      frames: [
        {sprite: 's', delay: 100},
        {sprite: 's', delay: 100},
      ],
    };
    const builder = new WorldBuilder({id: 'wr', name: 'WR'})
      .useRules([AnimationRule])
      .useAnimations({oneShot});
    const world = builder.getWorld();
    const actor = builder.addActor(
      new ActorBuilder({id: 'ar', name: 'AR'})
        .useTraits([AppearanceTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(AnimationProperty, 'oneShot'),
    );

    let ends = 0;
    actor.on(AnimationEndedEvent, () => {
      ends += 1;
    });
    // Run it to completion: it holds the last frame and fires once.
    for (let i = 0; i < 5; i++) {
      world.tick(0.1);
    }
    expect(actor.get(FrameProperty)).toBe(1);
    expect(ends).toBe(1);

    // Replaying the *same* animation restarts it from frame 0…
    playAnimation(actor, 'oneShot');
    world.tick(0); // the step consumes the request and resets
    expect(actor.get(FrameProperty)).toBe(0);
    // …and it plays through and ends again.
    for (let i = 0; i < 5; i++) {
      world.tick(0.1);
    }
    expect(actor.get(FrameProperty)).toBe(1);
    expect(ends).toBe(2);
  });

  it('leaves a looping animation cycling when it is replayed (no hitch)', () => {
    const {world, actor} = makeWorld('coinSpin');
    world.tick(0.3); // advance a few frames into the loop
    const frame = actor.get(FrameProperty);
    expect(frame).toBeGreaterThan(0);
    // Replaying the same looping animation must not snap it back to frame 0.
    playAnimation(actor, 'coinSpin');
    world.tick(0);
    expect(actor.get(FrameProperty)).toBe(frame);
  });

  it('emits FrameChangedEvent with the new frame index on each advance', () => {
    const {world, actor} = makeWorld('coinSpin'); // 6 frames, ~83ms each
    const frames: unknown[] = [];
    actor.on(FrameChangedEvent, (_world, _actor, detail) =>
      frames.push(detail),
    );
    // Advance well past one loop; the first six frame changes are 1..5 then 0.
    for (let i = 0; i < 8; i++) {
      world.tick(0.1);
    }
    expect(frames.slice(0, 6)).toEqual([1, 2, 3, 4, 5, 0]);
  });

  it('resets frame state when the selected animation changes', () => {
    const {world, actor} = makeWorld('coinSpin');
    world.tick(0.3); // advance several frames
    expect(actor.get(FrameProperty)).toBeGreaterThan(0);
    actor.set(AnimationProperty, 'playerWalk'); // switch
    world.tick(0); // step notices the switch and resets
    expect(actor.get(FrameProperty)).toBe(0);
  });

  it('renderSnapshot reports the current animation frame cell, or the sprite, or nothing', () => {
    const {world, actor} = makeWorld('coinSpin');
    world.tick(0.1); // frame 1
    const frame = world.renderSnapshot().find(s => s.actor === actor)?.frame;
    expect(frame?.sprite).toBe('coinSpin.png');
    expect(frame?.cell).toEqual({x: 32, y: 0, width: 32, height: 32});

    // Clearing the animation and setting a static sprite reports a whole image.
    actor.set(AnimationProperty, '');
    actor.set(SpriteProperty, 'player');
    world.tick(0);
    const still = world.renderSnapshot().find(s => s.actor === actor)?.frame;
    expect(still?.sprite).toBe('player');
    expect(still?.cell).toBe(undefined);
  });
});
