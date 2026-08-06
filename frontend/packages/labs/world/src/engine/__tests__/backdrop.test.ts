// The backdrop: the appearance half of an actor, on its own.
//
// What it has to be is a thing you can draw and filter; what it has to NOT be is
// a body — nothing here gives it a position, a trait, or a place in the rules
// (BACKGROUNDS.md §1). The rest of these cases are about the two seams a
// backdrop sits on: the builder/live-world symmetry every `world.…` block
// depends on, and the effect bookkeeping the hot reloader reads.

import {describe, expect, it} from 'vitest';

import type {EffectDocument} from '../../effect/model/types';
import {DEFAULT_LAYER_ID} from '../core/Layer';
import {DEFAULT_BACKDROP_COLOR, rgba, World, WorldBuilder} from '../index';

const doc = (nodeId: string): EffectDocument => ({
  version: 1,
  name: 'Ripple',
  parameters: [],
  nodes: [{id: nodeId, type: 'sample', position: {x: 0, y: 0}}],
  edges: [],
  functions: [],
});

const world = () => new World({id: 'w', name: 'W', rules: [], overrides: []});

describe('a world backdrop', () => {
  it('has one, in the default colour, before anyone says anything', () => {
    // One per layer now, and a world that names no layers has one layer.
    const w = world();
    const [backdrop, ...rest] = w.backdropSnapshot();

    expect(backdrop.sprite).toBeUndefined();
    expect(backdrop.effects).toEqual([]);
    expect(rest).toEqual([]);
    // The colour is the WORLD's, not the layer's: a colour on any layer but the
    // bottom is behind the layer under it and can never be seen.
    expect(w.backdropColor()).toEqual(rgba(DEFAULT_BACKDROP_COLOR));
  });

  it('draws the image it is given, and stops when it is cleared', () => {
    const w = world();

    w.setBackground('cave.png');
    expect(w.backdropSnapshot()[0].sprite).toBe('cave.png');

    w.setBackground(undefined);
    expect(w.backdropSnapshot()[0].sprite).toBeUndefined();
    // Clearing the image leaves the colour: there is always something behind.
    expect(w.backdropColor()).toEqual(rgba(DEFAULT_BACKDROP_COLOR));
  });

  it('takes a colour from anything a colour block produces', () => {
    const w = world();

    w.setBackgroundColor('#88ccff');
    expect(w.backdropColor()).toEqual(rgba('#88ccff'));

    // The `r g b a` block's floats, including an alpha hex cannot express.
    w.setBackgroundColor([0.1, 0.2, 0.3, 0.5]);
    expect(w.backdropColor()).toEqual([0.1, 0.2, 0.3, 0.5]);
  });

  it('carries effects of its own, retuned rather than stacked', () => {
    const w = world();

    w.addBackgroundEffect('effects/ripple', doc('a'), {speed: 1});
    w.addBackgroundEffect('effects/ripple', doc('a'), {speed: 4});

    expect(w.backdropSnapshot()[0].effects).toEqual([
      {path: 'effects/ripple', document: doc('a'), values: {speed: 4}},
    ]);

    w.removeBackgroundEffect('effects/ripple');
    expect(w.backdropSnapshot()[0].effects).toEqual([]);
    // Removing one that is not playing is not an error.
    expect(() => w.removeBackgroundEffect('effects/ripple')).not.toThrow();
  });

  it('keeps its effects apart from the ones on the camera', () => {
    // The whole reason a backdrop carries effects: a world effect filters
    // everything the camera drew, this filters the sky and leaves the actors.
    const w = world();
    w.addEffect('effects/underwater', doc('u'));
    w.addBackgroundEffect('effects/ripple', doc('r'));

    expect(w.effects().map(effect => effect.path)).toEqual([
      'effects/underwater',
    ]);
    expect(w.backdropSnapshot()[0].effects.map(effect => effect.path)).toEqual([
      'effects/ripple',
    ]);
    // But the reloader has to see both, or an edit to one of them is lost.
    expect(
      w
        .allEffects()
        .map(effect => effect.path)
        .sort(),
    ).toEqual(['effects/ripple', 'effects/underwater']);
  });

  it('gets the new graph when its effect file is edited', () => {
    // The live half of editing a `.effect`. Without the backdrop in this sweep,
    // an effect used ONLY on the backdrop would never swap its shader.
    const w = world();
    w.addBackgroundEffect('effects/ripple', doc('before'));

    expect(w.setEffectDocument('effects/ripple', doc('after'))).toBe(true);
    expect(w.backdropSnapshot()[0].effects[0].document).toEqual(doc('after'));
  });

  it('reports what it draws, and what it plays, in its snapshot', () => {
    const w = world();
    w.setBackground('cave.png').setBackgroundColor('#88ccff');
    w.addBackgroundEffect('effects/ripple', doc('a'));

    const snapshot = w.snapshot();
    expect(snapshot.backdrops).toEqual([
      {layer: DEFAULT_LAYER_ID, sprite: 'cave.png'},
    ]);
    // The colour is the world's, so it travels on its own.
    expect(snapshot.clearColor).toEqual(rgba('#88ccff'));
    // The effect is structural, so it travels with everyone else's — as a slot
    // saying what carries it, which for a backdrop is its layer.
    expect(snapshot.effectIds).toContain(
      `["backdrop:${DEFAULT_LAYER_ID}","effects/ripple"]`,
    );
    // Its knobs travel beside it, and are patchable rather than structural.
    expect(
      snapshot.effectValues[
        `["backdrop:${DEFAULT_LAYER_ID}","effects/ripple"]`
      ],
    ).toBeUndefined();
  });

  it('paints the layer it is told, and the default when told none', () => {
    // The `layer` argument is a LAYER now rather than an index into a stack of
    // its own — which is what makes a background a layer's background.
    const w = new WorldBuilder({id: 'w', name: 'W'})
      .defineLayer({id: 'sky'})
      .defineLayer({id: DEFAULT_LAYER_ID})
      .instantiate();

    w.setBackground('clouds.png', 'sky');
    w.setBackground('cave.png');

    expect(w.backdropSnapshot().map(slot => slot.sprite)).toEqual([
      'clouds.png',
      'cave.png',
    ]);
  });

  it('paints the default layer when told one that is gone', () => {
    // The id comes from generated code naming a `define layer` block; deleting
    // that block should paint somewhere visible, not take the world down.
    const w = world();
    w.setBackground('cave.png', 'a-layer-that-was-deleted');

    expect(w.backdropSnapshot()[0].sprite).toBe('cave.png');
  });
});

describe('a described backdrop', () => {
  it('says the same thing to the builder and to the live world', () => {
    // `set background to …` is one block, and `world` is the builder inside a
    // `.world` file and the live World inside an event handler. If these two
    // disagreed, where the block sat would decide whether it worked.
    const described = new WorldBuilder({id: 'w', name: 'W'})
      .setBackground('cave.png')
      .setBackgroundColor('#88ccff')
      .addBackgroundEffect('effects/ripple', doc('a'))
      .instantiate();

    const live = world();
    live.setBackground('cave.png');
    live.setBackgroundColor('#88ccff');
    live.addBackgroundEffect('effects/ripple', doc('a'));

    expect(described.backdropSnapshot()).toEqual(live.backdropSnapshot());
  });

  it('forwards to the world once there is one', () => {
    const builder = new WorldBuilder({id: 'w', name: 'W'});
    const built = builder.getWorld();

    builder.setBackground('cave.png');
    builder.setBackgroundColor('#88ccff');
    builder.addBackgroundEffect('effects/ripple', doc('a'));

    expect(built.backdropSnapshot()[0]).toEqual({
      sprite: 'cave.png',
      effects: [{path: 'effects/ripple', document: doc('a')}],
    });
    expect(built.backdropColor()).toEqual(rgba('#88ccff'));
  });

  it('gives each world it instantiates a backdrop of its own', () => {
    // Two worlds from one description (the thumbnail renderer builds throwaways)
    // must not share a backdrop, or changing one changes the other.
    const builder = new WorldBuilder({id: 'w', name: 'W'}).setBackground(
      'cave.png',
    );
    const first = builder.instantiate();
    const second = builder.instantiate();

    first.setBackground('city.png');
    expect(second.backdropSnapshot()[0].sprite).toBe('cave.png');
  });
});
