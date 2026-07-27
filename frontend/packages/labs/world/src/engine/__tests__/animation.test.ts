import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  AnimationEndedEvent,
  AnimationProperty,
  AnimationRule,
  AppearanceTrait,
  FrameChangedEvent,
  FrameProperty,
  PositionProperty,
  SceneBuilder,
  SpriteProperty,
  Vector,
  WorldBuilder,
  type AnimationDef,
} from '../index';

// A world with the Animation rule and one actor that has the appearance trait.
function makeScene(animation = '') {
  const scene = new SceneBuilder({id: 'game', name: 'Game'});
  const world = scene.useWorld(
    new WorldBuilder({id: 'w', name: 'W'}).useRules([AnimationRule]),
  );
  const actor = scene.addActor(
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
    const {world, actor} = makeScene('coinSpin');
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

  it('holds the last frame and emits AnimationEnded once when a non-looping animation finishes', () => {
    const oneShot: AnimationDef = {
      loop: false,
      frames: [
        {sprite: 's', delay: 100},
        {sprite: 's', delay: 100},
      ],
    };
    const scene = new SceneBuilder({id: 'g2', name: 'G2'});
    const world = scene.useWorld(
      new WorldBuilder({id: 'w2', name: 'W2'})
        .useRules([AnimationRule])
        .useAnimations({oneShot}),
    );
    const actor = scene.addActor(
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

  it('emits FrameChangedEvent with the new frame index on each advance', () => {
    const {world, actor} = makeScene('coinSpin'); // 6 frames, ~83ms each
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
    const {world, actor} = makeScene('coinSpin');
    world.tick(0.3); // advance several frames
    expect(actor.get(FrameProperty)).toBeGreaterThan(0);
    actor.set(AnimationProperty, 'playerWalk'); // switch
    world.tick(0); // step notices the switch and resets
    expect(actor.get(FrameProperty)).toBe(0);
  });

  it('renderSnapshot reports the current animation frame cell, or the sprite, or nothing', () => {
    const {world, actor} = makeScene('coinSpin');
    world.tick(0.1); // frame 1
    const frame = world.renderSnapshot().find(s => s.actor === actor)?.frame;
    expect(frame?.sprite).toBe('coinSpin');
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
