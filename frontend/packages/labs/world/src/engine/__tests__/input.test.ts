import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  ControlledByArrowsTrait,
  InputRule,
  KeyPressedEvent,
  KeyReleasedEvent,
  MoveSpeedProperty,
  MovableTrait,
  PositionProperty,
  Vector,
  VelocityProperty,
  WorldBuilder,
} from '../index';

// A minimal input world: one actor controlled by the arrow keys, no gravity, so
// the vertical component stays put and horizontal motion is easy to read.
function makeWorld(start = new Vector(100, 100)) {
  const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([InputRule]);
  const world = builder.getWorld();
  const player = builder.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([ControlledByArrowsTrait])
      .set(PositionProperty, start),
  );
  return {world, player};
}

describe('the Input rule', () => {
  it('"Controlled by Arrow Keys" pulls in Can Move', () => {
    const {player} = makeWorld();
    expect(player.has(ControlledByArrowsTrait)).toBe(true);
    expect(player.has(MovableTrait)).toBe(true);
  });

  it('moves the actor right while the right arrow is held', () => {
    const {world, player} = makeWorld();
    world.setInput(['ArrowRight']);
    world.tick(1);
    // vx = +150 (default speed), integrated over 1s: x 100 → 250, y unchanged.
    expect(player.get(PositionProperty).x).toBeCloseTo(250);
    expect(player.get(PositionProperty).y).toBeCloseTo(100);
  });

  it('moves left, and stops when no key is held', () => {
    const {world, player} = makeWorld(new Vector(250, 100));
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
    const {world, player} = makeWorld();
    player.set(MoveSpeedProperty, 300);
    world.setInput(['ArrowRight']);
    world.tick(0.5);
    // 300 px/s over 0.5s = 150: x 100 → 250.
    expect(player.get(PositionProperty).x).toBeCloseTo(250);
  });
});

describe('key press / release events (edge-triggered)', () => {
  it('fires on rising/falling edges, not while a key is held', () => {
    const {world, player} = makeWorld();
    const pressed: unknown[] = [];
    const released: unknown[] = [];
    player.on(KeyPressedEvent, (_world, _actor, key) => pressed.push(key));
    player.on(KeyReleasedEvent, (_world, _actor, key) => released.push(key));

    world.setInput([' ']); // space goes down
    world.tick(0.1);
    expect(pressed).toEqual([' ']);
    expect(released).toEqual([]);

    world.setInput([' ']); // still held — no new press
    world.tick(0.1);
    expect(pressed).toEqual([' ']);

    world.setInput([]); // released
    world.tick(0.1);
    expect(released).toEqual([' ']);
    expect(pressed).toEqual([' ']);
  });
});
