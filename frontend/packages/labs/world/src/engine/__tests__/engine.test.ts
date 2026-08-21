import {describe, expect, it} from 'vitest';

import {
  ActorBuilder,
  one,
  PositionProperty,
  PositionalTrait,
  ScaleProperty,
  SkewProperty,
  Vector,
  WorldBuilder,
} from '../index';

// Neither gravity nor collision is part of the engine any more — both are
// `.rule` files a project imports (rules/stock). The rules these tests drive
// engine machinery WITH live beside them; see the fixtures' headers.
import {
  CollidableTrait,
  CollisionRule,
  IsTouchingQuery,
  SizeProperty,
  SolidTrait,
  TouchingQuery,
} from './fixtures/collisionRule';
import {
  AffectedByGravityTrait,
  FallingProperty,
  GravityRule,
  GravityScaleProperty,
  GroundTrait,
  IsOnGroundQuery,
  StartsFallingEvent,
  StopsFallingEvent,
  StrengthProperty,
} from './fixtures/gravityRule';
import {MovableTrait, VelocityProperty} from './fixtures/motionRule';

// Build a gravity world with one faller and one ground actor, wired through the
// public builders exactly as a learner's world would be. Sizes are explicit so
// the half-extent landing math is unambiguous: neither actor has a sprite, so
// without an override each would fall back to the default box.
function makeWorld(
  playerStart = new Vector(0, 0),
  groundY = 100,
  playerSize = new Vector(20, 20),
  groundSize = new Vector(20, 20),
) {
  const builder = new WorldBuilder({id: 'platform', name: 'Platform'}).useRules(
    [GravityRule],
  );
  const world = builder.getWorld();
  const player = builder.addActor(
    new ActorBuilder({id: 'player', name: 'Player'})
      .useTraits([AffectedByGravityTrait])
      .set(PositionProperty, playerStart)
      .set(SizeProperty, playerSize),
  );
  builder.addActor(
    new ActorBuilder({id: 'ground', name: 'Ground'})
      .useTraits([GroundTrait])
      .set(PositionProperty, new Vector(0, groundY))
      .set(SizeProperty, groundSize),
  );
  return {world, player};
}

describe('trait resolution through the standard rules', () => {
  it('applying "Affected by Gravity" pulls in its dependency traits', () => {
    const {player} = makeWorld();
    expect(player.has(AffectedByGravityTrait)).toBe(true);
    expect(player.has(MovableTrait)).toBe(true); // required by affected
    expect(player.has(CollidableTrait)).toBe(true); // required by affected
    expect(player.has(PositionalTrait)).toBe(true); // required transitively
    // Those four and nothing else the RULES brought — `appearance` is the
    // foundation every actor has whether or not it says so
    // (`ActorBuilder.instantiate`), like `positional`, which this actor was
    // already getting transitively rather than by asking.
    expect(
      player
        .traits()
        .map(t => t.id)
        .sort(),
    ).toEqual([
      'affected',
      'appearance',
      'collidable',
      'movable',
      'positional',
    ]);
    // Their properties are all seeded on the actor.
    expect(player.get(VelocityProperty).equals({x: 0, y: 0})).toBe(true);
    expect(player.get(FallingProperty)).toBe(false);
    expect(player.query(IsOnGroundQuery)).toBe(true);
  });
});

describe('gravity simulation', () => {
  const DELTA = 0.1; // strength 9 → +0.9 units/s of velocity per tick

  it('accelerates a faller and rests its box on the ground surface', () => {
    // Ground centre 120, half-height 10 → surface top at 110. Player half-height
    // 10 → its box bottom meets the surface when its centre reaches 100.
    const {world, player} = makeWorld(new Vector(0, 0), 120);
    let starts = 0;
    let stops = 0;
    player.on(StartsFallingEvent, () => (starts += 1));
    player.on(StopsFallingEvent, () => (stops += 1));

    // Tick 1: v=(0,0.9) — 90 px/s — p=(0,9), still in the air → starts falling.
    world.tick(DELTA);
    expect(player.get(VelocityProperty).y).toBeCloseTo(0.9);
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
    const {world, player} = makeWorld(
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
    const {world, player} = makeWorld(new Vector(0, 0), 120);
    player.set(ScaleProperty, new Vector(2, 2));
    for (let i = 0; i < 20; i++) {
      world.tick(DELTA);
    }
    expect(player.get(PositionProperty).y).toBeCloseTo(90);
  });

  it('falls again after walking off the edge of the ground', () => {
    // Ground and player are both 20px wide, centred at x=0 (span [-10, 10]).
    const {world, player} = makeWorld(new Vector(0, 0), 120);
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
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    const world = builder.getWorld();
    const player = builder.addActor(
      new ActorBuilder({id: 'player', name: 'Player'})
        .useTraits([AffectedByGravityTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(SizeProperty, new Vector(20, 20))
        .set(GravityScaleProperty, 0),
    );
    builder.addActor(
      new ActorBuilder({id: 'wall', name: 'Wall'})
        .useTraits([SolidTrait])
        .set(PositionProperty, new Vector(25, 0))
        .set(SizeProperty, new Vector(20, 400)),
    );
    // Drive the player rightward each tick (resolution zeroes the velocity on
    // contact); it must not tunnel through the wall despite a fast approach.
    for (let i = 0; i < 10; i++) {
      const {y} = player.get(VelocityProperty);
      player.set(VelocityProperty, new Vector(3, y));
      world.tick(DELTA);
    }
    // Player right edge (x + 10) rests against the wall's left face (15) → x = 5.
    expect(player.get(PositionProperty).x).toBeCloseTo(5);
  });

  it('blocks a plain movable actor at a solid wall — collision needs no gravity', () => {
    // No gravity anywhere: just Motion + Collision. Solidity is general, so a
    // bare movable body still cannot pass through a solid.
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      CollisionRule,
    ]);
    const world = builder.getWorld();
    const mover = builder.addActor(
      new ActorBuilder({id: 'mover', name: 'Mover'})
        .useTraits([MovableTrait, CollidableTrait])
        .set(PositionProperty, new Vector(0, 0))
        .set(SizeProperty, new Vector(20, 20)),
    );
    builder.addActor(
      new ActorBuilder({id: 'wall', name: 'Wall'})
        .useTraits([SolidTrait])
        .set(PositionProperty, new Vector(25, 0))
        .set(SizeProperty, new Vector(20, 20)),
    );
    for (let i = 0; i < 10; i++) {
      mover.set(VelocityProperty, new Vector(3, 0));
      world.tick(DELTA);
    }
    expect(mover.get(PositionProperty).x).toBeCloseTo(5);
  });

  it('passes up through a one-way ground and lands on top coming back down', () => {
    // A Ground-but-not-Solid platform at y=0 (top surface at -10). The player
    // starts below it and jumps: it rises straight through (one-way), then falls
    // and lands on top — proof it passed through, since it began underneath.
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    const world = builder.getWorld();
    const player = builder.addActor(
      new ActorBuilder({id: 'player', name: 'Player'})
        .useTraits([AffectedByGravityTrait])
        .set(PositionProperty, new Vector(0, 40)) // below the platform
        .set(SizeProperty, new Vector(20, 20)),
    );
    builder.addActor(
      new ActorBuilder({id: 'platform', name: 'Platform'})
        .useTraits([GroundTrait]) // landable, but NOT solid
        .set(PositionProperty, new Vector(0, 0))
        .set(SizeProperty, new Vector(20, 20)),
    );
    player.set(VelocityProperty, new Vector(0, -4)); // jump upward
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
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    const world = builder.getWorld();
    const player = builder.addActor(
      new ActorBuilder({id: 'player', name: 'Player'})
        .useTraits([AffectedByGravityTrait])
        .set(PositionProperty, new Vector(0, 100)) // resting on the lower block
        .set(SizeProperty, new Vector(20, 20)),
    );
    builder.addActor(
      new ActorBuilder({id: 'lower', name: 'Lower'})
        .useTraits([GroundTrait])
        .set(PositionProperty, new Vector(0, 120)) // surface top 110
        .set(SizeProperty, new Vector(20, 20)),
    );
    builder.addActor(
      new ActorBuilder({id: 'higher', name: 'Higher'})
        .useTraits([GroundTrait])
        .set(PositionProperty, new Vector(0, 60)) // above, overlaps x
        .set(SizeProperty, new Vector(20, 20)),
    );
    world.tick(DELTA);
    expect(player.get(PositionProperty).y).toBeCloseTo(100); // still on the lower
  });

  it('runs the steps in the intended per-tick order', () => {
    const {world} = makeWorld();
    expect(world.stepOrder().map(s => `${s.ownerId}.${s.id}`)).toEqual([
      // The foundation's, which no world asks for (WorldBuilder.rulesInPlay).
      'animation.advanceAnimation',
      'gravity.applyVelocity',
      'motion.reposition',
      'collision.resolve',
      'gravity.handleCollisions',
    ]);
  });
});

describe('world property hot-patch (hot-reload level 1)', () => {
  it('a live change to gravity strength takes effect on the next tick', () => {
    const {world, player} = makeWorld(new Vector(0, 0), 100_000); // ground far

    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeCloseTo(0.9); // 9 * 0.1

    // Patch the world-scoped property in place — no rebuild.
    world.set(StrengthProperty, 18);
    world.tick(0.1);
    // 0.9 + 18 * 0.1 = 2.7
    expect(player.get(VelocityProperty).y).toBeCloseTo(2.7);
  });

  it('patches one placed actor by the path a snapshot names', () => {
    // The actor half: a value edited on a `.actor` file reaches the running
    // game (specs/QUALITY_OF_LIFE.md §1), addressed one property at a time so
    // the patch touches nothing the learner did not change.
    const {world, player} = makeWorld(new Vector(0, 0), 100_000);
    world.tick(0.1); // the player has moved on

    expect(
      world.setActorProperty(
        player.id,
        'positional.position',
        new Vector(7, 3),
      ),
    ).toBe(true);

    expect(player.get(PositionProperty)).toEqual(new Vector(7, 3));
  });

  it('says so when there is no such actor or property', () => {
    // A patch is computed from a snapshot, and a snapshot can describe a world
    // that has since changed underneath it.
    const {world, player} = makeWorld(new Vector(0, 0), 100_000);

    expect(world.setActorProperty('nobody', 'positional.position', 1)).toBe(
      false,
    );
    expect(world.setActorProperty(player.id, 'nothing.here', 1)).toBe(false);
  });
});

describe('an actor’s own properties, enumerated', () => {
  // `traits()` is how everything else asks what an actor carries, and it
  // cannot answer for these — so anything walking traits to find out what may
  // be configured missed them. Two things were: the map editor's inspector,
  // and the lookup a placement's overrides are resolved against.

  it('reports what the kind declared, and no trait’s', () => {
    const template = new ActorBuilder({id: 'bar', name: 'Bar'}).useTraits([
      AffectedByGravityTrait,
    ]);
    const label = template.defineProperty('label', 'string', 'Bar');
    const actor = template.instantiate('one');

    expect(actor.ownProperties()).toEqual([label]);
    // …and the trait's are still the traits', which is the distinction.
    expect(actor.traits().length).toBeGreaterThan(0);
  });

  it('reports none for an actor that declared none', () => {
    const actor = new ActorBuilder({id: 'plain', name: 'Plain'})
      .useTraits([AffectedByGravityTrait])
      .instantiate('one');

    expect(actor.ownProperties()).toEqual([]);
  });
});

describe('WorldBuilder.loadMap (Map data)', () => {
  it('instantiates registered actor types and applies property overrides', () => {
    const builder = new WorldBuilder({
      id: 'platform',
      name: 'Platform',
    }).useRules([GravityRule]);
    const world = builder.getWorld();
    builder.define(
      'faller',
      new ActorBuilder({id: 'faller', name: 'Faller'}).useTraits([
        AffectedByGravityTrait,
      ]),
    );

    const [actor] = builder.loadMap({
      actors: [
        {type: 'faller', properties: {positional: {position: {x: 5, y: 7}}}},
      ],
    });

    expect(actor.get(PositionProperty).equals({x: 5, y: 7})).toBe(true);
    // The populated actor is live in the world.
    expect([...world.actors].length).toBe(1);
  });

  it('applies an override to a property the actor declared for ITSELF', () => {
    // These belong to no trait on purpose (`ActorBuilder.defineProperty`), and
    // the lookup a placement is resolved against walked the world's rules and
    // their traits — so a placement carrying one was dropped here in SILENCE.
    // Nothing noticed, because the map editor could not offer one either: the
    // inspector walks traits too (`describeActor`).
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const template = new ActorBuilder({id: 'bar', name: 'Bar'});
    const label = template.defineProperty('label', 'string', 'Bar');
    builder.define('actors/bar', template);

    const [actor] = builder.loadMap({
      actors: [{type: 'actors/bar', properties: {bar: {label: 'Boss'}}}],
    });

    expect(actor.get(label)).toBe('Boss');
  });

  it('leaves one alone when the placement says nothing about it', () => {
    // The template's value is what an unset placement inherits, which is what
    // the inspector shows as the default.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const template = new ActorBuilder({id: 'bar', name: 'Bar'});
    const label = template.defineProperty('label', 'string', 'Bar');
    builder.define('actors/bar', template);

    const [actor] = builder.loadMap({actors: [{type: 'actors/bar'}]});

    expect(actor.get(label)).toBe('Bar');
  });

  it('resolves an actor-typed value against another placement', () => {
    // A map is JSON and JSON holds no actors, so a placement names one by its
    // entry id. This is what makes the stock Health Bar placeable: point it at
    // the player in the map editor rather than in a block.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const bar = new ActorBuilder({id: 'bar', name: 'Bar'});
    const subject = bar.defineProperty<unknown>('subject', 'actor', '');
    builder.define('actors/bar', bar);
    builder.define('actors/player', new ActorBuilder({id: 'p', name: 'P'}));

    const [meter, player] = builder.loadMap({
      actors: [
        // The bar FIRST, naming an entry that does not exist yet — which is
        // the case ordering the entries could not have covered.
        {type: 'actors/bar', id: 'Meter', properties: {bar: {subject: 'Hero'}}},
        {type: 'actors/player', id: 'Hero'},
      ],
    });

    // Through `one`, because an actor value is held as a LIST whatever it was
    // set to — saying `actor` narrows what is generated around it, not how it
    // is stored (`actorValue`).
    expect(one(meter.get(subject) as never)).toBe(player);
  });

  it('lets two placements name each other', () => {
    // The other thing a second pass buys that an ordering cannot: a cycle has
    // no order to put it in.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const twin = new ActorBuilder({id: 'twin', name: 'Twin'});
    const other = twin.defineProperty<unknown>('other', 'actor', '');
    builder.define('actors/twin', twin);

    const [a, b] = builder.loadMap({
      actors: [
        {type: 'actors/twin', id: 'A', properties: {twin: {other: 'B'}}},
        {type: 'actors/twin', id: 'B', properties: {twin: {other: 'A'}}},
      ],
    });

    expect(one(a.get(other) as never)).toBe(b);
    expect(one(b.get(other) as never)).toBe(a);
  });

  it('leaves a reference to nothing unset, rather than failing the load', () => {
    // A placement may point at one that has since been deleted. Refusing the
    // map over it would take a whole level away for a bar pointed at a missing
    // enemy, so it is left as it was — which is what a map already does with a
    // property it cannot resolve.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const bar = new ActorBuilder({id: 'bar', name: 'Bar'});
    const subject = bar.defineProperty<unknown>('subject', 'actor', '');
    builder.define('actors/bar', bar);

    const [meter] = builder.loadMap({
      actors: [
        {type: 'actors/bar', id: 'Meter', properties: {bar: {subject: 'Gone'}}},
      ],
    });

    expect(meter.get(subject)).toEqual([]);
    expect([...builder.getWorld().actors].length).toBe(1);
  });

  it('stacks maps rather than replacing, so a level and a HUD compose', () => {
    // Loading is additive on purpose: a world loads a level map and a UI map,
    // which is the whole reason there is no separate Scene concept.
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    builder.define(
      'faller',
      new ActorBuilder({id: 'faller', name: 'Faller'}).useTraits([
        AffectedByGravityTrait,
      ]),
    );

    builder.loadMap({actors: [{type: 'faller', id: 'a'}]});
    builder.loadMap({actors: [{type: 'faller', id: 'b'}]});

    expect(builder.getWorld().snapshot().actorIds.sort()).toEqual(['a', 'b']);

    // …and `clear()` is how you replace instead of add.
    builder.clearActors();
    builder.loadMap({actors: [{type: 'faller', id: 'c'}]});
    expect(builder.getWorld().snapshot().actorIds).toEqual(['c']);
  });

  it('rejects a map that references an unregistered type', () => {
    const builder = new WorldBuilder({
      id: 'platform',
      name: 'Platform',
    }).useRules([GravityRule]);
    expect(() => builder.loadMap({actors: [{type: 'ghost'}]})).toThrow(
      /unregistered actor type/i,
    );
  });
});

describe('renderSnapshot (driver view)', () => {
  it('reports the transform of each positional actor, tracking the sim', () => {
    const {world, player} = makeWorld(new Vector(10, 0), 100);
    const before = world.renderSnapshot();
    // Both the player and the ground carry the positional trait.
    expect(before).toHaveLength(2);
    const playerState = before.find(s => s.actor === player);
    // Defaults come through, including a zero skew (no shear).
    expect(playerState).toMatchObject({
      x: 10,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      skew: 0,
    });

    world.tick(0.1); // player falls to y≈9
    const after = world.renderSnapshot().find(s => s.actor === player);
    expect(after?.y).toBeCloseTo(9);
    expect(after?.x).toBe(10);
  });

  it('reports an actor’s vertical skew', () => {
    const {world, player} = makeWorld(new Vector(0, 0), 120);
    player.set(SkewProperty, 30);
    expect(world.renderSnapshot().find(s => s.actor === player)?.skew).toBe(30);
  });

  it('is empty for a world without the Spatial rule', () => {
    const world = new WorldBuilder({id: 'bare', name: 'Bare'}).instantiate();
    expect(world.renderSnapshot()).toEqual([]);
  });

  it('has no frame for an actor without an appearance', () => {
    const {world, player} = makeWorld(new Vector(0, 0), 100);
    expect(world.renderSnapshot().find(s => s.actor === player)?.frame).toBe(
      undefined,
    );
  });
});

describe('snapshot + setWorldProperty (hot-reload support)', () => {
  it('captures structure and values, and patches a world property by path', () => {
    const {world, player} = makeWorld(new Vector(0, 0), 100);
    const snap = world.snapshot();

    // `animation` and `spatial` without anyone naming them: the first from the
    // foundation every world runs on, the second also required by motion.
    expect(snap.ruleIds).toEqual([
      'animation',
      'collision',
      'gravity',
      'motion',
      'spatial',
    ]);
    expect(snap.actorIds).toEqual(['ground', 'player']);
    expect(snap.world['gravity.strength']).toBe(9);
    // Actor property values are captured per actor, by trait.prop path.
    expect(snap.actors.player['positional.position']).toMatchObject({
      x: 0,
      y: 0,
    });

    // Patch by path — the running sim uses it on the next tick.
    expect(world.setWorldProperty('gravity.strength', 18)).toBe(true);
    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeCloseTo(1.8); // 18 * 0.1
    expect(world.snapshot().world['gravity.strength']).toBe(18);

    expect(world.setWorldProperty('nope.missing', 1)).toBe(false);
  });
});

describe('world actions', () => {
  it('invert flips gravity direction in place', () => {
    const {world, player} = makeWorld(new Vector(0, 0), 100_000);
    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeGreaterThan(0); // pulled down

    // Invert, then accelerate the other way until velocity points up.
    world.act(GravityRule.actions.invert);
    world.tick(0.1);
    world.tick(0.1);
    expect(player.get(VelocityProperty).y).toBeLessThan(0); // now pulled up
  });
});

describe('WorldBuilder.addActor (instances)', () => {
  function makeCoinWorld() {
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    const coin = () =>
      new ActorBuilder({id: 'coin', name: 'Coin'}).useTraits([PositionalTrait]);
    return {builder, coin};
  }

  it('gives a lone actor its template id and a repeat a random unique one', () => {
    const {builder, coin} = makeCoinWorld();
    const first = builder.addActor(coin());
    const second = builder.addActor(coin());
    expect(first.id).toBe('coin');
    expect(second.id).not.toBe('coin');
    expect(second.id.startsWith('coin-')).toBe(true);
    // Distinct instances, both sharing the template type, both in the snapshot.
    expect(first.type).toBe('coin');
    expect(second.type).toBe('coin');
    expect(builder.getWorld().snapshot().actorIds.sort()).toEqual(
      [first.id, second.id].sort(),
    );
  });

  it('honors an explicit id and sets per-instance props on the returned instance', () => {
    const {builder, coin} = makeCoinWorld();
    // The returned instance's set() chains, so placement reads inline.
    const c = builder
      .addActor(coin(), 'coin-a')
      .set(PositionProperty, new Vector(320, 70));
    expect(c.id).toBe('coin-a');
    expect(c.get(PositionProperty).equals({x: 320, y: 70})).toBe(true);
  });

  it('keeps an explicit base id stable, disambiguating repeats with an ordinal', () => {
    // Same base id twice — e.g. one Blockly `add` block running in a loop.
    const {builder, coin} = makeCoinWorld();
    const a = builder.addActor(coin(), 'coin-a');
    const b = builder.addActor(coin(), 'coin-a');
    const c = builder.addActor(coin(), 'coin-a');
    expect([a.id, b.id, c.id]).toEqual(['coin-a', 'coin-a#2', 'coin-a#3']);
  });
});

describe('TouchingQuery (Collision rule, via world.query)', () => {
  // Collidable actors with no explicit size get the default 32x32 box, so two
  // whose centers are within 32px on both axes touch.
  const at = (type: string, x: number, y: number) =>
    new ActorBuilder({id: type, name: type})
      .useTraits([CollidableTrait])
      .set(PositionProperty, new Vector(x, y));

  it('reports overlapping actors, excluding self and distant ones', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      CollisionRule,
    ]);
    const world = builder.getWorld();
    const player = builder.addActor(at('player', 0, 0));
    const nearCoin = builder.addActor(at('coin', 20, 0)); // overlaps
    const nearBox = builder.addActor(at('box', -10, 8)); // overlaps
    builder.addActor(at('coin', 200, 0)); // far coin — no overlap

    const touching = world.query(TouchingQuery, player);
    expect(new Set(touching)).toEqual(new Set([nearCoin, nearBox]));
    expect(touching).not.toContain(player); // never itself
  });

  it('filters to a single actor type', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      CollisionRule,
    ]);
    const world = builder.getWorld();
    const player = builder.addActor(at('player', 0, 0));
    const coinA = builder.addActor(at('coin', 16, 0)); // overlaps, type coin
    const coinB = builder.addActor(at('coin', 0, 16)); // overlaps, type coin
    builder.addActor(at('box', 8, 8)); // overlaps but type box

    const coins = world.query(TouchingQuery, player, 'coin');
    expect(new Set(coins)).toEqual(new Set([coinA, coinB]));
    expect(coins.every(a => a.type === 'coin')).toBe(true);
  });

  it('filters by the placed type, not the builder id (renamed template)', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      CollisionRule,
    ]);
    const world = builder.getWorld();
    // A template whose builder id ("Coin", e.g. derived from an authored name)
    // is NOT the module path the world places it under.
    const coinTemplate = new ActorBuilder({id: 'Coin', name: 'Coin'})
      .useTraits([CollidableTrait])
      .set(PositionProperty, new Vector(16, 0));
    const player = builder.addActor(
      at('player', 0, 0),
      undefined,
      'actors/player',
    );
    const coin = builder.addActor(coinTemplate, 'coin-1', 'actors/coin');
    expect(coin.type).toBe('actors/coin'); // the placed type, not 'Coin'

    // The loop filters by the module path and still finds the renamed coin.
    expect(world.query(TouchingQuery, player, 'actors/coin')).toEqual([coin]);
    // The stale builder id no longer matches anything.
    expect(world.query(TouchingQuery, player, 'Coin')).toEqual([]);
  });
});

describe('IsTouchingQuery (Collision predicate)', () => {
  const at = (type: string, x: number, y: number) =>
    new ActorBuilder({id: type, name: type})
      .useTraits([CollidableTrait])
      .set(PositionProperty, new Vector(x, y));

  it('is a boolean over two actors — overlap, excluding identity', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      CollisionRule,
    ]);
    const world = builder.getWorld();
    const player = builder.addActor(at('player', 0, 0));
    const near = builder.addActor(at('coin', 20, 0)); // overlaps
    const far = builder.addActor(at('coin', 200, 0)); // does not

    expect(world.query(IsTouchingQuery, player, near)).toBe(true);
    expect(world.query(IsTouchingQuery, player, far)).toBe(false);
    expect(world.query(IsTouchingQuery, player, player)).toBe(false); // never itself
  });

  it('filtering world.actors through the predicate rebuilds TouchingQuery', () => {
    // This is exactly what the generic `for each Actor … where (a is touching it)`
    // loop does — the predicate hoisted over the actor list equals the list query.
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      CollisionRule,
    ]);
    const world = builder.getWorld();
    const player = builder.addActor(at('player', 0, 0));
    builder.addActor(at('coin', 20, 0)); // overlaps
    builder.addActor(at('box', -10, 8)); // overlaps
    builder.addActor(at('coin', 200, 0)); // far

    const filtered = [...world.actors].filter(other =>
      world.query(IsTouchingQuery, player, other),
    );
    expect(new Set(filtered)).toEqual(
      new Set(world.query(TouchingQuery, player)),
    );
  });
});

describe('WorldBuilder declaration order', () => {
  // The builder has two halves and they run in order: everything declarative
  // describes a world that does not exist yet, and the first placement builds
  // it. A declaration arriving after that has nothing to affect — and since
  // Blockly blocks are reordered by dragging, a learner can produce exactly
  // that. Quietly dropping it would leave them with a world missing a rule they
  // can plainly see they asked for.
  const placed = () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    builder.addActor(new ActorBuilder({id: 'a', name: 'A'}));
    return builder;
  };

  it('refuses a rule added after the actors are placed', () => {
    expect(() => placed().useRules([GravityRule])).toThrow(
      /must come before the actors are placed/,
    );
  });

  it('names the block to move, not the internal state', () => {
    // The message is read by a learner in the console, so it says what to drag.
    expect(() => placed().useAnimations({})).toThrow(
      /move it above "load map"/,
    );
  });

  it('still allows `define`, which registers rather than places', () => {
    expect(() =>
      placed().define('a', new ActorBuilder({id: 'a', name: 'A'})),
    ).not.toThrow();
  });

  // The other half of the rule: a call the live world CAN answer is forwarded
  // to it rather than refused. These are the two that also exist as blocks a
  // learner may place in an event handler, where they land on the live world
  // and mean the same thing — so where they sit inside a `.world` file must not
  // decide whether they work.

  it('forwards a property set to the live world', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'}).useRules([
      GravityRule,
    ]);
    const world = builder.getWorld();

    builder.set(StrengthProperty, 25);

    expect(world.get(StrengthProperty)).toBe(25);
  });

  it('forwards an effect to the live world', () => {
    // A viewport filter has no relationship to the actors at all — the driver
    // reads `world.effects()` every frame — so ordering here is meaningless.
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const world = builder.getWorld();

    builder.addEffect('effects/underwater', {
      version: 1,
      name: 'Underwater',
      parameters: [],
      nodes: [],
      edges: [],
      functions: [],
    });

    expect(world.effects().map(effect => effect.path)).toEqual([
      'effects/underwater',
    ]);
  });
});

describe('WorldBuilder.getWorld', () => {
  it('returns the same World every time, not a fresh one', () => {
    // The preview relies on this. Build URLs are content-addressed, so an
    // unchanged project re-imports to the same module instance — and because
    // `getWorld()` memoizes, so it then hands back the very World that is
    // running. The preview detects that by identity
    // (`incoming === runningWorld`) and skips the reload entirely.
    //
    // If this ever started returning a fresh world, that check would silently
    // stop matching and every no-op rebuild would restart the game again — and,
    // worse, snapshot a mid-flight world as the baseline, breaking live reload
    // for the rest of the session.
    const builder = new WorldBuilder({id: 'w', name: 'W'});

    expect(builder.getWorld()).toBe(builder.getWorld());
  });
});
