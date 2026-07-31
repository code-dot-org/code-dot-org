// The driver's effect bookkeeping: which effects are attached to a Game Object
// and which are taken off, as the actor's list changes frame to frame.
//
// Phaser and the shader compiler are mocked away. What matters here is the
// difference the reconciler computes — attaching twice would stack a second
// filter on the object, and forgetting to detach would leave a removed effect
// on screen forever. Whether the resulting GLSL draws anything is a question
// only a browser can answer, and is checked there.

import {beforeEach, describe, expect, it, vi} from 'vitest';

import type {AppliedEffectSpec} from 'world-lab';

vi.mock('../../../effect/compiler', () => ({
  compileEffect: vi.fn((document: {name?: string}) => {
    if (document.name === 'Broken') {
      throw new Error('Nothing is connected to the Output yet.');
    }
    return {fragmentSource: '// glsl', parameters: []};
  }),
}));

vi.mock('../../../effect/runtime', () => ({
  registerEffect: vi.fn((_phaser, _scene, name: string) => ({
    renderNodeName: `EffectShader.${name}`,
  })),
  applyEffectToActor: vi.fn(() => ({remove: vi.fn()})),
}));

const {registerEffect, applyEffectToActor} = await import(
  '../../../effect/runtime'
);
const {EffectRegistry} = await import('../effects');

const spec = (path: string, name = 'Ripple'): AppliedEffectSpec =>
  ({path, document: {name}}) as unknown as AppliedEffectSpec;

const scene = {} as Phaser.Scene;
const phaser = {} as never;
const gameObject = () => ({}) as never;

/** The `remove` of the nth `applyEffectToActor` call. */
const removeOf = (call: number) =>
  vi.mocked(applyEffectToActor).mock.results[call].value.remove;

describe('EffectRegistry.reconcile', () => {
  let errors: string[];
  let registry: InstanceType<typeof EffectRegistry>;

  beforeEach(() => {
    vi.mocked(registerEffect).mockClear();
    vi.mocked(applyEffectToActor).mockClear();
    errors = [];
    registry = new EffectRegistry(phaser, message => errors.push(message));
  });

  it('attaches an effect the actor has gained', () => {
    const object = gameObject();

    registry.reconcile(scene, object, [spec('effects/ripple')]);

    expect(applyEffectToActor).toHaveBeenCalledTimes(1);
  });

  it('does not attach the same effect twice across frames', () => {
    // The reason the registry tracks what is live: Phaser would happily stack a
    // second filter, and the actor would ripple twice as hard every frame.
    const object = gameObject();
    const effects = [spec('effects/ripple')];

    registry.reconcile(scene, object, effects);
    registry.reconcile(scene, object, effects);
    registry.reconcile(scene, object, effects);

    expect(applyEffectToActor).toHaveBeenCalledTimes(1);
  });

  it('detaches an effect the actor has lost', () => {
    const object = gameObject();
    registry.reconcile(scene, object, [spec('effects/ripple')]);

    registry.reconcile(scene, object, []);

    expect(removeOf(0)).toHaveBeenCalledTimes(1);
  });

  it('re-attaches after a removal', () => {
    const object = gameObject();
    const effects = [spec('effects/ripple')];

    registry.reconcile(scene, object, effects);
    registry.reconcile(scene, object, []);
    registry.reconcile(scene, object, effects);

    expect(applyEffectToActor).toHaveBeenCalledTimes(2);
  });

  it('keeps one effect while removing another', () => {
    const object = gameObject();
    registry.reconcile(scene, object, [
      spec('effects/ripple'),
      spec('effects/glow'),
    ]);

    registry.reconcile(scene, object, [spec('effects/ripple')]);

    // The glow (second attach) goes; the ripple stays attached, not re-added.
    expect(removeOf(1)).toHaveBeenCalledTimes(1);
    expect(removeOf(0)).not.toHaveBeenCalled();
    expect(applyEffectToActor).toHaveBeenCalledTimes(2);
  });

  it('does nothing for an actor with no effects and none attached', () => {
    // The overwhelmingly common case, every frame, for every actor.
    registry.reconcile(scene, gameObject(), []);

    expect(registerEffect).not.toHaveBeenCalled();
    expect(applyEffectToActor).not.toHaveBeenCalled();
  });

  it('compiles and registers one render node per effect, not per actor', () => {
    // Twenty actors wearing one ripple should upload one shader program.
    registry.reconcile(scene, gameObject(), [spec('effects/ripple')]);
    registry.reconcile(scene, gameObject(), [spec('effects/ripple')]);

    expect(registerEffect).toHaveBeenCalledTimes(1);
    expect(applyEffectToActor).toHaveBeenCalledTimes(2);
  });

  it('tracks objects independently', () => {
    const first = gameObject();
    const second = gameObject();
    registry.reconcile(scene, first, [spec('effects/ripple')]);
    registry.reconcile(scene, second, [spec('effects/ripple')]);

    registry.reconcile(scene, first, []);

    expect(removeOf(0)).toHaveBeenCalledTimes(1);
    expect(removeOf(1)).not.toHaveBeenCalled();
  });

  it('reports a graph that will not compile, and draws the actor anyway', () => {
    registry.reconcile(scene, gameObject(), [spec('effects/bad', 'Broken')]);

    expect(errors).toEqual([
      'effects/bad.effect: Nothing is connected to the Output yet.',
    ]);
    expect(applyEffectToActor).not.toHaveBeenCalled();
  });

  it('reports a broken effect once, not once per frame', () => {
    // Called every frame for every actor wearing it; without the failure being
    // remembered the console would fill with the same sentence.
    const effects = [spec('effects/bad', 'Broken')];
    const object = gameObject();

    registry.reconcile(scene, object, effects);
    registry.reconcile(scene, object, effects);
    registry.reconcile(scene, gameObject(), effects);

    expect(errors).toHaveLength(1);
  });
});
