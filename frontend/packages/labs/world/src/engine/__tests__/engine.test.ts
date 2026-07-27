import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  AffectedByGravityTrait,
  CollidableTrait,
  CollisionRule,
  FallingProperty,
  GravityRule,
  GravityScaleProperty,
  GroundTrait,
  IsOnGroundQuery,
  MovableTrait,
  PositionProperty,
  PositionalTrait,
  ScaleProperty,
  SceneBuilder,
  SizeProperty,
  SolidTrait,
  StartsFallingEvent,
  StopsFallingEvent,
  StrengthProperty,
  Vector,
  VelocityProperty,
  WorldBuilder,
} from '../index';

// Build a gravity world with one faller and one ground actor, wired through the
// public builders exactly as a learner's scene would be. Sizes are explicit so
// the half-extent landing math is unambiguous: neither actor has a sprite, so
// without an override each would fall back to the default box.
function makeScene(
  playerStart = new Vector(0, 0),
  groundY = 100,
  playerSize = new Vector(20, 20),
  groundSize = new Vector(20, 20),
) {
  const scene = new SceneBuilder({id: 'game', name: 'Game'});
  const world = scene.useWorld(
    new WorldBuilder({id: 'platform', name: 'Platform'}).useRules([
      GravityRule,
    ]),
  );
  const player = scene.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, playerStart)
      .set(SizeProperty, playerSize),
  );
  scene.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait])
      .set(PositionProperty, new Vector(0, groundY))
      .set(SizeProperty, groundSize),
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

  it('accelerates a faller and rests its box on the ground surface', () => {
    // Ground centre 120, half-height 10 → surface top at 110. Player half-height
    // 10 → its box bottom meets the surface when its centre reaches 100.
    const {world, player} = makeScene(new Vector(0, 0), 120);
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

    // Ticks 2–4: keeps accelerating, still above the surface (p.y: 27, 54, 90).
    world.tick(DELTA);
    world.tick(DELTA);
    world.tick(DELTA);
    expect(player.get(PositionProperty).y).toBeCloseTo(90);
    expect(player.get(FallingProperty)).toBe(true);
    expect(starts).toBe(1); // only the one transition

    // Tick 5: would reach 135 → its box bottom meets the surface; centre rests
    // at 100 (not buried at the ground centre, 120), velocity zeroed.
    world.tick(DELTA);
    expect(player.get(PositionProperty).y).toBeCloseTo(100);
    expect(player.get(VelocityProperty).y).toBe(0);
    expect(player.get(FallingProperty)).toBe(false);
    expect(player.query(IsOnGroundQuery)).toBe(true);
    expect(stops).toBe(1);
  });

  it('rests a taller actor higher — the box half-height sets the resting centre', () => {
    // Same ground (surface top 110), but a 40px-tall player (half-height 20)
    // rests with its centre 20 above the surface, at 90.
    const {world, player} = makeScene(
      new Vector(0, 0),
      120,
      new Vector(40, 40),
    );
    for (let i = 0; i < 20; i++) {
      world.tick(DELTA);
    }
    expect(player.get(FallingProperty)).toBe(false);
    expect(player.get(PositionProperty).y).toBeCloseTo(90);
  });

  it('scales the collision box by the actor scale', () => {
    // A 20px player at 2× scale is a 40px box (half-height 20) → rests at 90.
    const {world, player} = makeScene(new Vector(0, 0), 120);
    player.set(ScaleProperty, new Vector(2, 2));
    for (let i = 0; i < 20; i++) {
      world.tick(DELTA);
    }
    expect(player.get(PositionProperty).y).toBeCloseTo(90);
  });

  it('falls again after walking off the edge of the ground', () => {
    // Ground and player are both 20px wide, centred at x=0 (span [-10, 10]).
    const {world, player} = makeScene(new Vector(0, 0), 120);
    for (let i = 0; i < 20; i++) {
      world.tick(DELTA);
    }
    expect(player.get(FallingProperty)).toBe(false); // resting on the block

    // Slide fully past the block's right edge — centres 40 apart, more than the
    // summed half-widths (20), so no horizontal overlap: support is gone.
    const {y} = player.get(PositionProperty);
    player.set(PositionProperty, new Vector(40, y));
    world.tick(DELTA);
    expect(player.get(FallingProperty)).toBe(true);

    // And it keeps accelerating downward, off the world.
    const afterOne = player.get(PositionProperty).y;
    world.tick(DELTA);
    expect(player.get(PositionProperty).y).toBeGreaterThan(afterOne);
  });

  it('stops at the side of a solid block instead of passing through it', () => {
    // A solid wall at x=25 (20 wide → left face at 15) reaching well above and
    // below the player. Gravity is disabled so this isolates the horizontal axis.
    const scene = new SceneBuilder({id: 'g', name: 'G'});
    const world = scene.useWorld(
      new WorldBuilder({id: 'w', name: 'W'}).useRules([GravityRule]),
    );
    const player = scene.addActor(
      new ActorBuilder({id: 'player', name: 'Player'})
        .useTraits([AffectedByGravityTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(SizeProperty, new Vector(20, 20))
        .set(GravityScaleProperty, 0),
    );
    scene.addActor(
      new ActorBuilder({id: 'wall', name: 'Wall'})
        .useTraits([SolidTrait])
        .set(PositionProperty, new Vector(25, 0))
        .set(SizeProperty, new Vector(20, 400)),
    );
    // Drive the player rightward each tick (resolution zeroes the velocity on
    // contact); it must not tunnel through the wall despite a fast approach.
    for (let i = 0; i < 10; i++) {
      const {y} = player.get(VelocityProperty);
      player.set(VelocityProperty, new Vector(300, y));
      world.tick(DELTA);
    }
    // Player right edge (x + 10) rests against the wall's left face (15) → x = 5.
    expect(player.get(PositionProperty).x).toBeCloseTo(5);
  });

  it('blocks a plain movable actor at a solid wall — collision needs no gravity', () => {
    // No gravity anywhere: just Motion + Collision. Solidity is general, so a
    // bare movable body still cannot pass through a solid.
    const scene = new SceneBuilder({id: 'g', name: 'G'});
    const world = scene.useWorld(
      new WorldBuilder({id: 'w', name: 'W'}).useRules([CollisionRule]),
    );
    const mover = scene.addActor(
      new ActorBuilder({id: 'mover', name: 'Mover'})
        .useTraits([MovableTrait, CollidableTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(SizeProperty, new Vector(20, 20)),
    );
    scene.addActor(
      new ActorBuilder({id: 'wall', name: 'Wall'})
        .useTraits([SolidTrait])
        .set(PositionProperty, new Vector(25, 0))
        .set(SizeProperty, new Vector(20, 20)),
    );
    for (let i = 0; i < 10; i++) {
      mover.set(VelocityProperty, new Vector(300, 0));
      world.tick(DELTA);
    }
    expect(mover.get(PositionProperty).x).toBeCloseTo(5);
  });

  it('passes up through a one-way ground and lands on top coming back down', () => {
    // A Ground-but-not-Solid platform at y=0 (top surface at -10). The player
    // starts below it and jumps: it rises straight through (one-way), then falls
    // and lands on top — proof it passed through, since it began underneath.
    const scene = new SceneBuilder({id: 'g', name: 'G'});
    const world = scene.useWorld(
      new WorldBuilder({id: 'w', name: 'W'}).useRules([GravityRule]),
    );
    const player = scene.addActor(
      new ActorBuilder({id: 'player', name: 'Player'})
        .useTraits([AffectedByGravityTrait])
        .set(PositionProperty, new Vector(0, 40)) // below the platform
        .set(SizeProperty, new Vector(20, 20)),
    );
    scene.addActor(
      new ActorBuilder({id: 'platform', name: 'Platform'})
        .useTraits([GroundTrait]) // landable, but NOT solid
        .set(PositionProperty, new Vector(0, 0))
        .set(SizeProperty, new Vector(20, 20)),
    );
    player.set(VelocityProperty, new Vector(0, -400)); // jump upward
    for (let i = 0; i < 60; i++) {
      world.tick(0.05);
    }
    // Rests on the platform's top: centre a half-height (10) above the top (-10).
    expect(player.get(PositionProperty).y).toBeCloseTo(-20);
    expect(player.get(FallingProperty)).toBe(false);
  });

  it('does not snap up onto a higher overlapping platform it never touched', () => {
    // Player already resting on a lower block; a second block overlaps its x but
    // sits well above it. The old min-surface model yanked the player up to the
    // higher block — full AABB leaves it on the block it is actually touching.
    const scene = new SceneBuilder({id: 'g', name: 'G'});
    const world = scene.useWorld(
      new WorldBuilder({id: 'w', name: 'W'}).useRules([GravityRule]),
    );
    const player = scene.addActor(
      new ActorBuilder({id: 'player', name: 'Player'})
        .useTraits([AffectedByGravityTrait])
        .set(PositionProperty, new Vector(0, 100)) // resting on the lower block
        .set(SizeProperty, new Vector(20, 20)),
    );
    scene.addActor(
      new ActorBuilder({id: 'lower', name: 'Lower'})
        .useTraits([GroundTrait])
        .set(PositionProperty, new Vector(0, 120)) // surface top 110
        .set(SizeProperty, new Vector(20, 20)),
    );
    scene.addActor(
      new ActorBuilder({id: 'higher', name: 'Higher'})
        .useTraits([GroundTrait])
        .set(PositionProperty, new Vector(0, 60)) // above, overlaps x
        .set(SizeProperty, new Vector(20, 20)),
    );
    world.tick(DELTA);
    expect(player.get(PositionProperty).y).toBeCloseTo(100); // still on the lower
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
