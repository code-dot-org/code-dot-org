import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  ControlledByArrowsTrait,
  InputRule,
  MoveSpeedProperty,
  MovableTrait,
  PositionProperty,
  SceneBuilder,
  Vector,
  VelocityProperty,
  WorldBuilder,
} from '../index';

// A minimal input world: one actor controlled by the arrow keys, no gravity, so
// the vertical component stays put and horizontal motion is easy to read.
function makeScene(start = new Vector(100, 100)) {
  const scene = new SceneBuilder({id: 'game', name: 'Game'});
  const world = scene.useWorld(
    new WorldBuilder({id: 'w', name: 'W'}).useRules([InputRule]),
  );
  const player = scene.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([ControlledByArrowsTrait])
      .set(PositionProperty, start),
  );
  return {world, player};
}

describe('the Input rule', () => {
  it('"Controlled by Arrow Keys" pulls in Can Move', () => {
    const {player} = makeScene();
    expect(player.has(ControlledByArrowsTrait)).toBe(true);
    expect(player.has(MovableTrait)).toBe(true);
  });

  it('moves the actor right while the right arrow is held', () => {
    const {world, player} = makeScene();
    world.setInput(['ArrowRight']);
    world.tick(1);
    // vx = +150 (default speed), integrated over 1s: x 100 → 250, y unchanged.
    expect(player.get(PositionProperty).x).toBeCloseTo(250);
    expect(player.get(PositionProperty).y).toBeCloseTo(100);
  });

  it('moves left, and stops when no key is held', () => {
    const {world, player} = makeScene(new Vector(250, 100));
    world.setInput(['ArrowLeft']);
    world.tick(1);
    expect(player.get(PositionProperty).x).toBeCloseTo(100);
    // Releasing the key zeroes horizontal velocity, so position holds.
    world.setInput([]);
    world.tick(1);
    expect(player.get(PositionProperty).x).toBeCloseTo(100);
    expect(player.get(VelocityProperty).x).toBeCloseTo(0);
  });

  it('honors a custom move speed', () => {
    const {world, player} = makeScene();
    player.set(MoveSpeedProperty, 300);
    world.setInput(['ArrowRight']);
    world.tick(0.5);
    // 300 px/s over 0.5s = 150: x 100 → 250.
    expect(player.get(PositionProperty).x).toBeCloseTo(250);
  });
});
