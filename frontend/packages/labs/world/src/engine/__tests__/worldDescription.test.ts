// A WorldBuilder is a description, and the description is a call log.
//
// Everything a World can be told after it exists is recorded and replayed into
// one. That replaces sixteen hand-written `if (this.built) … else …` pairs, and
// with them the bug they kept producing: a method added to `World` and not to
// the builder, found by a learner as `world.setLayerParallax is not a function`
// in their own game. There is now one implementation of "tell the world this",
// so the two sides cannot mean different things — which they did (see the
// effects idempotency case in effects.test.ts).
//
// The other half is WHEN a declaration is too late. It was "has a world been
// built", which is a proxy: reading a camera builds one, and a read has never
// been what makes a later `use rule` impossible. It is now what the error
// message always said — whether the actors have been placed.

import {describe, expect, it} from 'vitest';

import {ActorBuilder, WorldBuilder} from '..';
import {DEFAULT_LAYER_ID} from '../core/Layer';
import {Vector} from '../core/Vector';

import {GravityRule, StrengthProperty} from './fixtures/gravityRule';

const doc = (name: string) =>
  ({
    name,
    parameters: [],
    nodes: [],
  }) as never;

const builder = () => new WorldBuilder({id: 'w', name: 'W'});

describe('the description as a call log', () => {
  it('replays what was said before the world existed', () => {
    const world = builder().setBackgroundColor('#ff0000').instantiate();

    expect(world.backdropColor()).toEqual([1, 0, 0, 1]);
  });

  it('forwards what is said after it', () => {
    const made = builder();
    const world = made.getWorld();

    made.setBackgroundColor('#00ff00');

    expect(world.backdropColor()).toEqual([0, 1, 0, 1]);
  });

  it('keeps the order, because the order is the meaning', () => {
    // `add` then `remove` leaves none; the other way round leaves one. Nothing
    // in the log is merged or de-duplicated, so both come out right.
    const gone = builder()
      .addEffect('effects/underwater', doc('Underwater'))
      .removeEffect('effects/underwater')
      .instantiate();
    const kept = builder()
      .removeEffect('effects/underwater')
      .addEffect('effects/underwater', doc('Underwater'))
      .instantiate();

    expect(gone.effects()).toEqual([]);
    expect(kept.effects()).toHaveLength(1);
  });

  it('makes two worlds that share nothing', () => {
    // What `instantiate` is for — the thumbnail renderer builds one per picker
    // refresh beside the one the game is running. The log holds the arguments a
    // call was given and the World copies what it stores, so replaying it twice
    // cannot alias.
    const made = builder().setBackgroundOffset(new Vector(4, 4));
    const first = made.instantiate();
    const second = made.instantiate();

    first.setBackgroundOffset(new Vector(99, 99));

    expect(second.layerSnapshot()[0].id).toBe(DEFAULT_LAYER_ID);
    expect(second.backdropSnapshot()[0].offset).toEqual({x: 4, y: 4});
    expect(first.backdropSnapshot()[0].offset).toEqual({x: 99, y: 99});
  });

  it('gives each replayed world its own copy of a pose', () => {
    // The log holds the CameraInit the caller passed, and every replay reads
    // that same object. A World that adopted it rather than copying would have
    // two worlds sharing one camera position, so moving the game's camera would
    // move the thumbnail renderer's.
    const made = builder().defineCamera({
      id: 'chase',
      position: new Vector(2, 3),
    });
    const first = made.instantiate();
    const second = made.instantiate();

    first.setCameraPosition(new Vector(80, 90), 'chase');

    expect(second.camera('chase').position).toEqual(new Vector(2, 3));
  });
});

describe('when a declaration is too late', () => {
  it('is in time after a READ that happened to build the world', () => {
    // The case the old guard got wrong. `camera` and `actors` hand back objects
    // out of a world, so they build one — and under the old rule that alone
    // made every later `use rule` throw, though nothing had been placed.
    const made = builder();
    made.camera();

    expect(() => made.useRules([GravityRule])).not.toThrow();
    expect(made.getWorld().get(StrengthProperty)).toBe(9);
  });

  it('replays the log into the world it rebuilds', () => {
    // A declaration arriving after a read discards the world built by that
    // read. Everything said before it has to survive that, or the rebuild would
    // silently drop half the program.
    const made = builder().setBackgroundColor('#0000ff');
    made.camera();
    made.useRules([GravityRule]);

    expect(made.getWorld().backdropColor()).toEqual([0, 0, 1, 1]);
    expect(made.getWorld().get(StrengthProperty)).toBe(9);
  });

  it('is too late once an actor is placed', () => {
    const made = builder();
    made.addActor(new ActorBuilder({id: 'a', name: 'A'}));

    expect(() => made.useRules([GravityRule])).toThrow(
      /must come before the actors are placed/,
    );
    expect(() => made.useAnimations({})).toThrow(
      /must come before the actors are placed/,
    );
    expect(() => made.defineLayer({id: 'sky'})).toThrow(
      /must come before the actors are placed/,
    );
  });

  it('is in time again once the actors are cleared', () => {
    // Not a case any block produces — `clear world` sits in a handler, where
    // `world` is the live one. It falls out of asking the honest question, and
    // the honest answer is that a world with nothing in it can be relaid.
    const made = builder();
    made.addActor(new ActorBuilder({id: 'a', name: 'A'}));
    made.clearActors();

    expect(() => made.useRules([GravityRule])).not.toThrow();
  });
});

describe('reading the world from its own description', () => {
  it('gives no actors before any are placed', () => {
    // `first actor of type ⟨Player⟩` above `load map`. Empty is the truth, not
    // an error: at that point in the program there are none.
    expect([...builder().actors]).toEqual([]);
  });

  it('gives the actors once they are', () => {
    const made = builder();
    made.addActor(new ActorBuilder({id: 'a', name: 'A'}), 'a', 'actors/a');

    expect([...made.actors].map(actor => actor.id)).toEqual(['a']);
    expect(made.actors.ofType('actors/a')).toHaveLength(1);
  });

  it('reads the same world the description keeps writing to', () => {
    const made = builder();
    const actors = made.actors;
    made.addActor(new ActorBuilder({id: 'b', name: 'B'}));

    expect([...actors]).toHaveLength(1);
  });
});

describe('how big the world is', () => {
  // A camera that keeps the view inside the level has to ask. The size was in
  // every `.map` file the editor writes — it is what the map editor's
  // Width/Height set — and it stopped there: `loadMap` took the whole object
  // and read only `actors`.
  const map = (tiles: number) => ({
    size: {width: tiles, height: tiles},
    tile: {width: 32, height: 32},
    actors: [],
  });

  it('is one screen before any map is loaded', () => {
    // Not zero. A world with nothing placed in it is still somewhere.
    expect(builder().mapBounds()).toEqual(builder().viewSize());
  });

  it('is a VECTOR, because that is what its block reports', () => {
    // `map size` and `view size` are typed `Vector`, and every block that takes
    // one apart reads `.x`/`.y`. Reporting `{width, height}` made `x of ⟨map
    // size⟩` undefined and everything downstream NaN, with nothing thrown —
    // which is how the camera's clamp broke.
    const bounds = builder().mapBounds();

    expect(bounds).toBeInstanceOf(Vector);
    expect(bounds.x).toBe(builder().viewSize().x);
    expect((bounds as unknown as {width?: number}).width).toBeUndefined();
  });

  it('is the map’s once one is', () => {
    const made = builder();
    made.loadMap(map(30));

    expect(made.mapBounds()).toEqual(new Vector(960, 960));
  });

  it('is the LARGEST map, not the last', () => {
    // A world may load several — a level and a HUD. The honest answer to how
    // big it is is as big as the biggest thing in it, so a HUD the size of the
    // viewport must not shrink the level.
    const made = builder();
    made.loadMap(map(30));
    made.loadMap(map(10));

    expect(made.mapBounds()).toEqual(new Vector(960, 960));
  });

  it('ignores a map that carries no size', () => {
    // A map block synthesises its placements without one; the world keeps
    // whatever it had rather than collapsing to nothing.
    const made = builder();
    made.loadMap(map(30));
    made.loadMap({actors: []});

    expect(made.mapBounds()).toEqual(new Vector(960, 960));
  });
});

describe('somewhere in it, at random', () => {
  const map = (tiles: number) => ({
    size: {width: tiles, height: tiles},
    tile: {width: 32, height: 32},
    actors: [],
  });

  it('lands inside the map, both axes, every time', () => {
    const made = builder();
    made.loadMap(map(30));

    for (let attempt = 0; attempt < 200; attempt += 1) {
      const place = made.randomPlace();

      expect(place.x).toBeGreaterThanOrEqual(0);
      expect(place.x).toBeLessThan(960);
      expect(place.y).toBeGreaterThanOrEqual(0);
      expect(place.y).toBeLessThan(960);
    }
  });

  it('draws each axis separately', () => {
    // One random number used for both axes scatters everything down a
    // diagonal, which looks deliberate enough to ship by accident. Two hundred
    // points landing exactly on x === y is not luck.
    const made = builder();
    made.loadMap(map(30));

    const places = Array.from({length: 200}, () => made.randomPlace());

    expect(places.every(place => place.x === place.y)).toBe(false);
  });

  it('is a Vector, like every other place', () => {
    // Same reason `map size` is one: everything downstream reads `.x`/`.y`.
    expect(builder().randomPlace()).toBeInstanceOf(Vector);
  });

  it('follows the map when it grows', () => {
    // The point of asking the world rather than doing the arithmetic by hand:
    // a bigger map scatters over the bigger area with nothing else changed.
    const made = builder();
    made.loadMap(map(60));

    const widest = Math.max(
      ...Array.from({length: 500}, () => made.randomPlace().x),
    );

    expect(widest).toBeGreaterThan(960);
  });
});
