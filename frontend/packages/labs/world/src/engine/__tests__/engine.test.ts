import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  AffectedByGravityTrait,
  CollidableTrait,
  FallingProperty,
  GravityRule,
  GroundTrait,
  IsOnGroundQuery,
  MovableTrait,
  PositionProperty,
  PositionalTrait,
  SceneBuilder,
  StartsFallingEvent,
  StopsFallingEvent,
  StrengthProperty,
  Vector,
  VelocityProperty,
  WorldBuilder,
} from '../index';

// Build a gravity world with one faller and one ground actor, wired through the
// public builders exactly as a learner's scene would be.
function makeScene(playerStart = new Vector(0, 0), groundY = 100) {
  const scene = new SceneBuilder({id: 'game', name: 'Game'});
  const world = scene.useWorld(
    new WorldBuilder({id: 'platform', name: 'Platform'}).useRules([
      GravityRule,
    ]),
  );
  const player = scene.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, playerStart),
  );
  scene.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait])
      .set(PositionProperty, new Vector(0, groundY)),
  );
  return {world, player};
}

describe('trait resolution through the standard rules', () => {
  it('applying "Affected by Gravity" pulls in its dependency traits', () => {
    const {player} = makeScene();
    expect(player.has(AffectedByGravityTrait)).toBe(true);
    expect(player.has(MovableTrait)).toBe(true); // required by affected
    expect(player.has(CollidableTrait)).toBe(true); // required by affected
    expect(player.has(PositionalTrait)).toBe(true); // required transitively
    // Exactly those four, nothing else.
    expect(
      player
        .traits()
        .map(t => t.id)
        .sort(),
    ).toEqual(['affected', 'collidable', 'movable', 'positional']);
    // Their properties are all seeded on the actor.
    expect(player.get(VelocityProperty).equals({x: 0, y: 0})).toBe(true);
    expect(player.get(FallingProperty)).toBe(false);
    expect(player.query(IsOnGroundQuery)).toBe(true);
  });
});

describe('gravity simulation', () => {
  const DELTA = 0.1; // strength 900 → +90 px/s of velocity per tick

  it('accelerates a faller and lands it on the ground', () => {
    const {world, player} = makeScene(new Vector(0, 0), 100);
    let starts = 0;
    let stops = 0;
    player.on(StartsFallingEvent, () => (starts += 1));
    player.on(StopsFallingEvent, () => (stops += 1));

    // Tick 1: v=(0,90), p=(0,9), still in the air → starts falling.
    world.tick(DELTA);
    expect(player.get(VelocityProperty).y).toBeCloseTo(90);
    expect(player.get(PositionProperty).y).toBeCloseTo(9);
    expect(player.get(FallingProperty)).toBe(true);
    expect(starts).toBe(1);
    expect(stops).toBe(0);

    // Ticks 2–4: keeps accelerating, still above the ground (p.y: 27, 54, 90).
    world.tick(DELTA);
    world.tick(DELTA);
    world.tick(DELTA);
    expect(player.get(PositionProperty).y).toBeCloseTo(90);
    expect(player.get(FallingProperty)).toBe(true);
    expect(starts).toBe(1); // only the one transition

    // Tick 5: would reach 135 → clamps to the ground at 100, velocity zeroed.
    world.tick(DELTA);
    expect(player.get(PositionProperty).y).toBeCloseTo(100);
    expect(player.get(VelocityProperty).y).toBe(0);
    expect(player.get(FallingProperty)).toBe(false);
    expect(player.query(IsOnGroundQuery)).toBe(true);
    expect(stops).toBe(1);
  });

  it('runs the steps in the intended per-tick order', () => {
    const {world} = makeScene();
    expect(world.stepOrder().map(s => `${s.ownerId}.${s.id}`)).toEqual([
      'gravity.applyVelocity',
      'motion.reposition',
      'collision.resolve',
      'gravity.handleCollisions',
    ]);
  });
});

describe('world property hot-patch (hot-reload level 1)', () => {
  it('a live change to gravity strength takes effect on the next tick', () => {
    const {world, player} = makeScene(new Vector(0, 0), 100_000); // ground far

    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeCloseTo(90); // 900 * 0.1

    // Patch the world-scoped property in place — no rebuild.
    world.set(StrengthProperty, 1800);
    world.tick(0.1);
    // 90 + 1800 * 0.1 = 270
    expect(player.get(VelocityProperty).y).toBeCloseTo(270);
  });
});

describe('SceneBuilder.populate (Map data)', () => {
  it('instantiates registered actor types and applies property overrides', () => {
    const scene = new SceneBuilder({id: 'game', name: 'Game'});
    const world = scene.useWorld(
      new WorldBuilder({id: 'platform', name: 'Platform'}).useRules([
        GravityRule,
      ]),
    );
    scene.define(
      'faller',
      new ActorBuilder({id: 'faller', name: 'Faller'}).useTraits([
        AffectedByGravityTrait,
      ]),
    );

    const [actor] = scene.populate({
      actors: [
        {type: 'faller', properties: {positional: {position: {x: 5, y: 7}}}},
      ],
    });

    expect(actor.get(PositionProperty).equals({x: 5, y: 7})).toBe(true);
    // The populated actor is live in the world.
    expect([...world.actors].length).toBe(1);
  });

  it('rejects a map that references an unregistered type', () => {
    const scene = new SceneBuilder({id: 'game', name: 'Game'});
    scene.useWorld(
      new WorldBuilder({id: 'platform', name: 'Platform'}).useRules([
        GravityRule,
      ]),
    );
    expect(() => scene.populate({actors: [{type: 'ghost'}]})).toThrow(
      /unregistered actor type/i,
    );
  });
});

describe('renderSnapshot (driver view)', () => {
  it('reports the transform of each positional actor, tracking the sim', () => {
    const {world, player} = makeScene(new Vector(10, 0), 100);
    const before = world.renderSnapshot();
    // Both the player and the ground carry the positional trait.
    expect(before).toHaveLength(2);
    const playerState = before.find(s => s.actor === player);
    expect(playerState).toMatchObject({x: 10, y: 0, scaleX: 1, scaleY: 1});

    world.tick(0.1); // player falls to y≈9
    const after = world.renderSnapshot().find(s => s.actor === player);
    expect(after?.y).toBeCloseTo(9);
    expect(after?.x).toBe(10);
  });

  it('is empty for a world without the Spatial rule', () => {
    const world = new WorldBuilder({id: 'bare', name: 'Bare'}).instantiate();
    expect(world.renderSnapshot()).toEqual([]);
  });

  it('has no frame for an actor without an appearance', () => {
    const {world, player} = makeScene(new Vector(0, 0), 100);
    expect(world.renderSnapshot().find(s => s.actor === player)?.frame).toBe(
      undefined,
    );
  });
});

describe('snapshot + setWorldProperty (hot-reload support)', () => {
  it('captures structure and values, and patches a world property by path', () => {
    const {world, player} = makeScene(new Vector(0, 0), 100);
    const snap = world.snapshot();

    expect(snap.ruleIds).toEqual(['collision', 'gravity', 'motion', 'spatial']);
    expect(snap.actorIds).toEqual(['ground', 'player']);
    expect(snap.world['gravity.strength']).toBe(900);
    // Actor property values are captured per actor, by trait.prop path.
    expect(snap.actors.player['positional.position']).toMatchObject({
      x: 0,
      y: 0,
    });

    // Patch by path — the running sim uses it on the next tick.
    expect(world.setWorldProperty('gravity.strength', 1800)).toBe(true);
    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeCloseTo(180); // 1800 * 0.1
    expect(world.snapshot().world['gravity.strength']).toBe(1800);

    expect(world.setWorldProperty('nope.missing', 1)).toBe(false);
  });
});

describe('world actions', () => {
  it('invert flips gravity direction in place', () => {
    const {world, player} = makeScene(new Vector(0, 0), 100_000);
    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeGreaterThan(0); // pulled down

    // Invert, then accelerate the other way until velocity points up.
    world.act(GravityRule.actions.invert);
    world.tick(0.1);
    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeLessThan(0); // now pulled up
  });
});
