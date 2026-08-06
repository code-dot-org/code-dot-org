// Layers: which group an actor is drawn in, and in what order the groups draw.
//
// Slice one of specs/VIEWPORT.md. A world that names no layers has exactly one
// — the default — so every world today behaves as it did, and no code has to
// ask whether an actor has a layer at all. What is NOT here yet is anything
// that moves: with no camera the view never moves, so a parallax factor is
// carried and not read. Depth is the part that works.

import {describe, expect, it} from 'vitest';

import type {EffectDocument} from '../../effect/model/types';
import {DEFAULT_LAYER_ID} from '../core/Layer';
import {ActorBuilder, PositionProperty, Vector, WorldBuilder} from '../index';
import type {World} from '../index';

const actor = (id: string) =>
  new ActorBuilder({id, name: id})
    .set(PositionProperty, new Vector(10, 10))
    .instantiate(id);

const world = () => new WorldBuilder({id: 'w', name: 'W'}).instantiate();

/** A slot nothing has touched: nothing drawn, where it was, stretched. */
const EMPTY_SLOT = {
  effects: [],
  offset: new Vector(0, 0),
  repeat: false,
};

/** A minimal parsed `.effect`, for the slots that carry effects. */
const RIPPLE: EffectDocument = {
  version: 1,
  name: 'Ripple',
  parameters: [],
  nodes: [],
  edges: [],
  functions: [],
};

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

describe('a layer’s background', () => {
  // What a 'backdrop' was. The world used to hold a flat stack of them at a
  // fixed negative depth; they belong to a layer, which is already the thing
  // with a depth (and later a parallax factor) for a slot to inherit.
  const built = () =>
    new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'sky'})
      .defineLayer({id: DEFAULT_LAYER_ID})
      .instantiate();

  it('is empty on every layer until something says otherwise', () => {
    expect(built().backdropSnapshot()).toEqual([EMPTY_SLOT, EMPTY_SLOT]);
  });

  it('is reported in stack order, one per layer', () => {
    const world = built();
    world.setBackground('clouds.png', 'sky');
    world.setBackground('cave.png');

    expect(world.backdropSnapshot().map(slot => slot.sprite)).toEqual([
      'clouds.png',
      'cave.png',
    ]);
  });

  it('carries effects keyed by the LAYER, not by a stack index', () => {
    // An index would silently renumber every effect below a layer declared
    // above it, and each would come back attached to the wrong background.
    const world = built();
    world.addBackgroundEffect('effects/ripple', RIPPLE, undefined, 'sky');

    expect(world.snapshot().effectIds).toContain(
      '["backdrop:sky","effects/ripple"]',
    );
  });

  it('leaves the colour to the world — there is one sky', () => {
    // A colour on any layer but the bottom is behind the layer under it and can
    // never be seen, so it is not a per-layer thing at all (BACKGROUNDS.md).
    const world = built();
    world.setBackgroundColor('#88ccff');

    expect(world.snapshot().clearColor).toEqual(world.backdropColor());
    expect(world.backdropSnapshot()[0]).not.toHaveProperty('color');
  });
});

describe('a layer’s foreground', () => {
  const built = () =>
    new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'game'})
      .defineLayer({id: DEFAULT_LAYER_ID})
      .instantiate();

  it('is the background’s twin, on the other side of the actors', () => {
    const world = built();
    world.setBackground('sky.png', 'game');
    world.setForeground('fog.png', 'game');

    expect(world.backdropSnapshot()[0].sprite).toBe('sky.png');
    expect(world.foregroundSnapshot()[0].sprite).toBe('fog.png');
    // Independent slots: setting one does not disturb the other.
    world.setBackground(undefined, 'game');
    expect(world.foregroundSnapshot()[0].sprite).toBe('fog.png');
  });

  it('is empty on every layer until something says otherwise', () => {
    expect(built().foregroundSnapshot()).toEqual([EMPTY_SLOT, EMPTY_SLOT]);
  });

  it('carries effects under a key of its own', () => {
    // `backdrop:` and `foreground:` on the same layer are two carriers, not
    // one — otherwise fogging a layer would retune its sky.
    const world = built();
    world.addBackgroundEffect('effects/ripple', RIPPLE, undefined, 'game');
    world.addForegroundEffect('effects/ripple', RIPPLE, undefined, 'game');

    const {effectIds} = world.snapshot();
    expect(effectIds).toContain('["backdrop:game","effects/ripple"]');
    expect(effectIds).toContain('["foreground:game","effects/ripple"]');
  });
});

describe('sliding a slot', () => {
  // The other term in `camera position (*) parallax + offset`. A factor ties an
  // image to the camera and to nothing else, so a background on a still camera
  // never moves however it is set — drift is the part that works before there
  // is a camera at all.
  const built = () =>
    new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'sky'})
      .defineLayer({id: DEFAULT_LAYER_ID})
      .instantiate();

  it('starts where it is, stretched', () => {
    const [slot] = built().backdropSnapshot();

    expect(slot.offset).toEqual(new Vector(0, 0));
    expect(slot.repeat).toBe(false);
  });

  it('moves the slot it is told, and no other', () => {
    const world = built();
    world.setBackgroundOffset(new Vector(12, -4), 'sky');

    expect(world.backdropSnapshot()[0].offset).toEqual(new Vector(12, -4));
    expect(world.backdropSnapshot()[1].offset).toEqual(new Vector(0, 0));
    // A layer's two slots drift independently — fog and sky at once.
    expect(world.foregroundSnapshot()[0].offset).toEqual(new Vector(0, 0));
  });

  it('copies the vector rather than holding the caller’s', () => {
    // A step writing this every tick would otherwise share one Vector with the
    // world, and mutating it in place would move the sky with no call at all.
    const world = built();
    const drift = new Vector(1, 0);
    world.setBackgroundOffset(drift, 'sky');
    // Reaching past `readonly`, which is what a mutating step would do anyway.
    (drift as {x: number}).x = 99;

    expect(world.backdropSnapshot()[0].offset.x).toBe(1);
  });

  it('is a VALUE in the snapshot, beside what the slot draws', () => {
    // Written every tick by a drifting layer: structural would restart the game
    // sixty times a second.
    const world = built();
    world.setBackgroundOffset(new Vector(8, 0), 'sky');
    world.setBackgroundRepeat(true, 'sky');

    const [slot] = world.snapshot().backdrops;
    expect(slot).toMatchObject({
      layer: 'sky',
      offset: {x: 8, y: 0},
      repeat: true,
    });
    // And not in the structure, which is what decides reload versus patch.
    expect(world.snapshot().layers.join()).not.toContain('8');
  });
});

describe('an effect on a layer itself', () => {
  // The scope between a slot's and the world's: a slot effect filters one
  // image, a world effect filters the whole screen after everything is
  // composited, and this filters one layer's worth of it.
  const built = () =>
    new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'game'})
      .defineLayer({id: 'hud'})
      .instantiate();

  it('is carried by the layer, and by no other', () => {
    const world = built();
    world.addLayerEffect('effects/blur', RIPPLE, undefined, 'game');

    // By id, not by position: a world that names no `main` gets one prepended,
    // so the declared layers are not the first entries.
    const of = (id: string) =>
      world.layerSnapshot().find(layer => layer.id === id)!.effects;
    expect(of('game').map(effect => effect.path)).toEqual(['effects/blur']);
    expect(of('hud')).toEqual([]);
  });

  it('is retuned rather than stacked, like every other owner', () => {
    const world = built();
    world.addLayerEffect('effects/blur', RIPPLE, {amount: 1}, 'game');
    world.addLayerEffect('effects/blur', RIPPLE, {amount: 4}, 'game');

    const game = world.layerSnapshot().find(layer => layer.id === 'game')!;
    expect(game.effects).toHaveLength(1);
    expect(game.effects[0].values).toEqual({amount: 4});
  });

  it('travels under a key of its own, beside the slots’', () => {
    // Three carriers on one layer — the layer, its background, its foreground —
    // so filtering the layer must not retune its sky.
    const world = built();
    world.addLayerEffect('effects/blur', RIPPLE, undefined, 'game');
    world.addBackgroundEffect('effects/blur', RIPPLE, undefined, 'game');

    const {effectIds} = world.snapshot();
    expect(effectIds).toContain('["layer:game","effects/blur"]');
    expect(effectIds).toContain('["backdrop:game","effects/blur"]');
  });

  it('stops when it is removed', () => {
    const world = built();
    world.addLayerEffect('effects/blur', RIPPLE, undefined, 'game');
    world.removeLayerEffect('effects/blur', 'game');

    expect(
      world.layerSnapshot().find(layer => layer.id === 'game')!.effects,
    ).toEqual([]);
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

describe('asking which actors are in a layer', () => {
  const built = () => {
    const world = new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'game'})
      .defineLayer({id: 'hud'})
      .instantiate();
    world.addActor(actor('player'), 'game');
    world.addActor(actor('coin'), 'game');
    world.addActor(actor('score'), 'hud');
    world.addActor(actor('stray'));
    return world;
  };

  it('gives every actor drawn in it', () => {
    expect(
      built()
        .actors.inLayer('game')
        .map(a => a.id),
    ).toEqual(['player', 'coin']);
  });

  it('does not reach the actors of another layer', () => {
    // The reason the filter exists: a rule that must not touch the HUD has no
    // other way to say so.
    expect(
      built()
        .actors.inLayer('hud')
        .map(a => a.id),
    ).toEqual(['score']);
  });

  it('finds the ones nothing placed deliberately, in the default', () => {
    expect(
      built()
        .actors.inLayer(DEFAULT_LAYER_ID)
        .map(a => a.id),
    ).toEqual(['stray']);
  });

  it('gives none for a layer that is not there', () => {
    // Rather than throwing: the id comes from generated code naming a block.
    expect(built().actors.inLayer('a-layer-that-was-deleted')).toEqual([]);
  });

  it('is a copy, so a loop that places actors terminates', () => {
    const world = built();
    const walked = world.actors.inLayer('game');
    world.addActor(actor('late'), 'game');

    expect(walked).toHaveLength(2);
  });
});

describe('the camera', () => {
  // A pose, and nothing else. It is not in `world.actors`, so no rule has to
  // learn to skip it and `clear world` does not take it away with the level.
  it('exists without being asked for, at the origin', () => {
    const built = world();

    expect(built.cameras).toHaveLength(1);
    expect(built.camera().id).toBe('main');
    expect(built.camera().position).toEqual(new Vector(0, 0));
  });

  it('moves where it is told', () => {
    const built = world();
    built.setCameraPosition(new Vector(64, -32));

    expect(built.camera().position).toEqual(new Vector(64, -32));
    expect(built.cameraSnapshot()[0].position).toEqual({x: 64, y: -32});
  });

  it('copies the vector rather than holding the caller’s', () => {
    // A follow step writes this every tick; sharing one Vector with the world
    // would let a later mutation move the view with no call at all.
    const built = world();
    const at = new Vector(10, 0);
    built.setCameraPosition(at);
    (at as {x: number}).x = 99;

    expect(built.camera().position.x).toBe(10);
  });

  it('answers with the default for an id nothing declares', () => {
    // The id comes from generated code; a world with no view at all is not a
    // better answer than a world looking through its default.
    expect(world().camera('a-camera-that-was-deleted').id).toBe('main');
  });

  it('is not an actor', () => {
    const built = world();
    built.addActor(actor('player'));
    built.clearActors();

    // The level went; the view did not.
    expect(built.cameras).toHaveLength(1);
    expect([...built.actors]).toHaveLength(0);
  });

  it('can be joined by another, and the view cut to it', () => {
    const built = world();
    built.defineCamera({id: 'overview', name: 'Overview'});
    built.setCameraPosition(new Vector(500, 0), 'overview');

    // Still looking through the default until told otherwise.
    expect(built.activeCamera().id).toBe('main');

    built.setActiveCamera('overview');
    expect(built.activeCamera().position).toEqual(new Vector(500, 0));
    expect(built.cameraSnapshot().find(c => c.active)?.id).toBe('overview');
  });

  it('ignores a cut to a camera that is not there', () => {
    // Leaving the view where it is beats blacking it out: the id comes from
    // generated code naming a block that may have been deleted.
    const built = world();
    built.setActiveCamera('a-camera-that-was-deleted');

    expect(built.activeCamera().id).toBe('main');
  });

  it('does not stack duplicates when the same camera is declared twice', () => {
    // A reload runs the world body again; two cameras with one id would be two
    // entries the dropdown shows twice.
    const built = world();
    built.defineCamera({id: 'overview'});
    built.defineCamera({id: 'overview'});

    expect(built.cameras).toHaveLength(2);
  });

  it('travels as structure AND as a value, which are different questions', () => {
    // Which cameras exist is a reload — a viewport is built to draw through
    // one. Where they look is a patch, written every tick by a follow step.
    const built = world();
    const before = built.snapshot();
    built.setCameraPosition(new Vector(5, 0));
    const after = built.snapshot();

    expect(after.cameras).toEqual(before.cameras);
    expect(after.cameraPositions).not.toEqual(before.cameraPositions);
  });

  it('cuts between cameras as a value, so the game does not restart', () => {
    const built = world();
    built.defineCamera({id: 'overview'});
    const before = built.snapshot();
    built.setActiveCamera('overview');
    const after = built.snapshot();

    // Which cameras EXIST is unchanged; which one draws is not structure.
    expect(after.cameras).toEqual(before.cameras);
    expect(after.activeCamera).not.toEqual(before.activeCamera);
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

  it('does NOT differ when a layer’s motion changes', () => {
    // How a layer responds to the camera is read every frame and builds
    // nothing, so it is a value: turning it must patch the running game rather
    // than restart it. A rule may turn it every tick.
    const built = new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'sky'})
      .instantiate();
    const before = built.snapshot();
    built.setLayerParallax(new Vector(0.2, 0), 'sky');
    const after = built.snapshot();

    expect(after.layers).toEqual(before.layers);
    expect(after.layerMotion).not.toEqual(before.layerMotion);
  });
});

describe('declaring a layer after the world is built', () => {
  it('is refused, because declaration order is draw order', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    builder.addActor(new ActorBuilder({id: 'a', name: 'a'}));

    expect(() => builder.defineLayer({id: 'late'})).toThrow(/define layer/);
  });
});
