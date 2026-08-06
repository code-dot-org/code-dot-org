// Layers: which group an actor is drawn in, and in what order the groups draw.
//
// Slice one of specs/VIEWPORT.md. A world that names no layers has exactly one
// — the default — so every world today behaves as it did, and no code has to
// ask whether an actor has a layer at all. What is NOT here yet is anything
// that moves: with no camera the view never moves, so a parallax factor is
// carried and not read. Depth is the part that works.

import {describe, expect, it} from 'vitest';

import {DEFAULT_LAYER_ID} from '../core/Layer';
import {ActorBuilder, PositionProperty, Vector, WorldBuilder} from '../index';
import type {World} from '../index';

const actor = (id: string) =>
  new ActorBuilder({id, name: id})
    .set(PositionProperty, new Vector(10, 10))
    .instantiate(id);

const world = () => new WorldBuilder({id: 'w', name: 'W'}).instantiate();

/** Every actor's layer depth, by actor id, as the driver would read it. */
const depths = (built: World): Record<string, number> =>
  Object.fromEntries(
    built.renderSnapshot().map(state => [state.actor.id, state.layer]),
  );

describe('a world that names no layers', () => {
  it('still has one, and it is the default', () => {
    const built = world();

    expect(built.layers).toHaveLength(1);
    expect(built.layers[0].id).toBe(DEFAULT_LAYER_ID);
  });

  it('puts every actor in it', () => {
    const built = world();
    built.addActor(actor('a'));

    expect(built.actors.ofType('a')[0].layer).toBe(DEFAULT_LAYER_ID);
    expect(depths(built)).toEqual({a: 0});
  });

  it('gives that layer the neutral settings', () => {
    // Carried, not read — there is no camera to be a factor of yet.
    const [layer] = world().layers;

    expect(layer.parallax).toEqual(new Vector(1, 1));
    expect(layer.fit).toBe(false);
  });
});

describe('a world that names layers', () => {
  const built = () =>
    new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'sky', parallax: new Vector(0.2, 0)})
      .defineLayer({id: DEFAULT_LAYER_ID})
      .defineLayer({id: 'hud', fit: true})
      .instantiate();

  it('keeps them in declaration order, which is depth', () => {
    expect(built().layers.map(layer => layer.id)).toEqual([
      'sky',
      DEFAULT_LAYER_ID,
      'hud',
    ]);
  });

  it('draws an actor at its layer’s depth', () => {
    const world = built();
    world.addActor(actor('cloud'), 'sky');
    world.addActor(actor('player'));
    world.addActor(actor('score'), 'hud');

    expect(depths(world)).toEqual({cloud: 0, player: 1, score: 2});
  });

  it('keeps each layer’s own settings', () => {
    const [sky, , hud] = built().layers;

    expect(sky.parallax).toEqual(new Vector(0.2, 0));
    expect(sky.fit).toBe(false);
    // A factor of (0,0) is not `fit` — the factor is translation only. Nothing
    // reads either yet; this pins that they are stored apart.
    expect(hud.fit).toBe(true);
    expect(hud.parallax).toEqual(new Vector(1, 1));
  });

  it('puts an actor in the default layer when told nothing', () => {
    // Even though the default is declared second here, "no layer given" still
    // means it rather than "the first one".
    const world = built();
    world.addActor(actor('player'));

    expect(world.actors.ofType('player')[0].layer).toBe(DEFAULT_LAYER_ID);
    expect(depths(world)).toEqual({player: 1});
  });

  it('puts an actor in the default layer when told a layer that is gone', () => {
    // The id comes from generated code naming a `define layer` block. Deleting
    // that block while something still names it should leave the actors
    // somewhere visible rather than take the world down.
    const world = built();
    world.addActor(actor('orphan'), 'a-layer-that-was-deleted');

    expect(world.actors.ofType('orphan')[0].layer).toBe(DEFAULT_LAYER_ID);
  });

  it('adds the default layer at the back when it is not named', () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'hud', fit: true})
      .instantiate();

    expect(world.layers.map(layer => layer.id)).toEqual([
      DEFAULT_LAYER_ID,
      'hud',
    ]);
  });
});

describe('leaving a layer', () => {
  it('is what removal means, along with leaving the world', () => {
    const built = world();
    const one = actor('a');
    built.addActor(one);

    built.removeActor(one);

    expect(one.layer).toBeUndefined();
    expect(one.world).toBeUndefined();
  });

  it('happens to every actor when the world is cleared', () => {
    const built = world();
    const one = actor('a');
    built.addActor(one);

    built.clearActors();

    expect(one.layer).toBeUndefined();
  });
});

describe('the snapshot', () => {
  // Layers are structural: a layer cannot be spliced into a live scene graph,
  // and reordering two changes what draws on top of what. Both are reloads.
  const snapshotOf = (...ids: string[]) => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    for (const id of ids) {
      builder.defineLayer({id});
    }
    return builder.instantiate().snapshot().layers;
  };

  it('reports the layers in stack order', () => {
    expect(snapshotOf('sky', DEFAULT_LAYER_ID)).toHaveLength(2);
    expect(snapshotOf('sky', DEFAULT_LAYER_ID)[0]).toContain('sky');
  });

  it('differs when two layers are reordered', () => {
    // Sorted ids would compare equal here, and the reload would be skipped.
    expect(snapshotOf('sky', 'hud')).not.toEqual(snapshotOf('hud', 'sky'));
  });

  it('differs when a layer’s settings change', () => {
    const withFactor = (x: number) =>
      new WorldBuilder({id: 'w', name: 'W'})
        .defineLayer({id: 'sky', parallax: new Vector(x, 0)})
        .instantiate()
        .snapshot().layers;

    expect(withFactor(0.2)).not.toEqual(withFactor(0.5));
  });
});

describe('declaring a layer after the world is built', () => {
  it('is refused, because declaration order is draw order', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    builder.addActor(new ActorBuilder({id: 'a', name: 'a'}));

    expect(() => builder.defineLayer({id: 'late'})).toThrow(/define layer/);
  });
});
