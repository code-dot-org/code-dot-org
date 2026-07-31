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
    version: 0,
  })),
  applyEffectToActor: vi.fn(() => ({
    remove: vi.fn(),
    controller: {uniformValues: null},
  })),
  applyEffectToWorld: vi.fn(() => ({
    remove: vi.fn(),
    controller: {uniformValues: null},
  })),
  updateEffect: vi.fn(),
  buildUniformValues: vi.fn(() => new Map([['uParam', 1]])),
}));

const {
  registerEffect,
  applyEffectToActor,
  applyEffectToWorld,
  updateEffect,
  buildUniformValues,
} = await import('../../../effect/runtime');
const {EffectRegistry} = await import('../effects');

/**
 * An applied effect. Documents are shared by name, because that is how they
 * really arrive: a `.effect` is an ES module import, so ten actors wearing one
 * effect all hold the *same* document object. The registry compares documents
 * by identity, so a fixture minting a fresh object per call would look like an
 * edit on every frame.
 */
const documents = new Map<string, object>();
const spec = (path: string, name = 'Ripple'): AppliedEffectSpec => {
  if (!documents.has(name)) {
    documents.set(name, {name});
  }
  return {path, document: documents.get(name)} as unknown as AppliedEffectSpec;
};

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
    vi.mocked(applyEffectToWorld).mockClear();
    vi.mocked(updateEffect).mockClear();
    vi.mocked(buildUniformValues).mockClear();
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

  describe('the camera', () => {
    const camera = () => ({}) as never;

    it('attaches a viewport effect to the camera, not to an object', () => {
      // An actor's effect filters its own pixels; a world's filters everything
      // the camera drew. Different call, same bookkeeping.
      registry.reconcileCamera(scene, camera(), [spec('effects/underwater')]);

      expect(applyEffectToWorld).toHaveBeenCalledTimes(1);
      expect(applyEffectToActor).not.toHaveBeenCalled();
    });

    it('does not re-attach across frames', () => {
      const view = camera();
      const effects = [spec('effects/underwater')];

      registry.reconcileCamera(scene, view, effects);
      registry.reconcileCamera(scene, view, effects);

      expect(applyEffectToWorld).toHaveBeenCalledTimes(1);
    });

    it('detaches one the world has dropped', () => {
      const view = camera();
      registry.reconcileCamera(scene, view, [spec('effects/underwater')]);

      registry.reconcileCamera(scene, view, []);

      expect(
        vi.mocked(applyEffectToWorld).mock.results[0].value.remove,
      ).toHaveBeenCalledTimes(1);
    });

    it('shares the compiled shader with an actor using the same effect', () => {
      // Keyed by path, so one program serves both surfaces.
      registry.reconcileCamera(scene, camera(), [spec('effects/ripple')]);
      registry.reconcile(scene, gameObject(), [spec('effects/ripple')]);

      expect(registerEffect).toHaveBeenCalledTimes(1);
    });
  });

  describe('a live shader swap', () => {
    /** The same effect at the same path, carrying a different graph object. */
    const edited = (path: string) =>
      ({
        path,
        document: {name: 'Ripple', edited: true},
      }) as unknown as AppliedEffectSpec;

    it('swaps the shader when the graph changed, without re-registering', () => {
      // Phaser throws if a render node name is registered twice, so an edit has
      // to replace the program on the node that is already there.
      const object = gameObject();
      registry.reconcile(scene, object, [spec('effects/ripple')]);

      registry.reconcile(scene, object, [edited('effects/ripple')]);

      expect(updateEffect).toHaveBeenCalledTimes(1);
      expect(registerEffect).toHaveBeenCalledTimes(1);
    });

    it('does not detach and re-attach the filter', () => {
      // The point of swapping in place: the filter keeps drawing, so the game
      // never blinks.
      const object = gameObject();
      registry.reconcile(scene, object, [spec('effects/ripple')]);

      registry.reconcile(scene, object, [edited('effects/ripple')]);

      expect(applyEffectToActor).toHaveBeenCalledTimes(1);
      expect(removeOf(0)).not.toHaveBeenCalled();
    });

    it('rebuilds the uniform values of every attached filter', () => {
      // A new graph may declare different parameters; the old value map is
      // keyed for the old ones.
      const first = gameObject();
      const second = gameObject();
      registry.reconcile(scene, first, [spec('effects/ripple')]);
      registry.reconcile(scene, second, [spec('effects/ripple')]);

      registry.reconcile(scene, first, [edited('effects/ripple')]);

      expect(buildUniformValues).toHaveBeenCalledTimes(2);
    });

    it('does nothing when the graph object is unchanged', () => {
      // Compared by identity: the engine replaces the whole spec on an edit, so
      // the same object means the same graph, every frame, for free.
      const object = gameObject();
      const effects = [spec('effects/ripple')];

      registry.reconcile(scene, object, effects);
      registry.reconcile(scene, object, effects);

      expect(updateEffect).not.toHaveBeenCalled();
    });

    it('keeps the previous shader when the new graph will not compile', () => {
      // Half-finished edits are normal while authoring; blanking the effect
      // would punish the learner for one, and the editor already shows them
      // the error.
      const object = gameObject();
      registry.reconcile(scene, object, [spec('effects/ripple')]);

      registry.reconcile(scene, object, [spec('effects/ripple', 'Broken')]);

      expect(updateEffect).not.toHaveBeenCalled();
      expect(removeOf(0)).not.toHaveBeenCalled();
      expect(errors).toHaveLength(1);
    });

    it('reports again if a repaired effect breaks a second time', () => {
      const object = gameObject();
      registry.reconcile(scene, object, [spec('effects/ripple', 'Broken')]);
      expect(errors).toHaveLength(1);

      // Repaired…
      registry.reconcile(scene, object, [edited('effects/ripple')]);
      // …then broken again. Without clearing the remembered failure this
      // second break would be swallowed.
      registry.reconcile(scene, object, [spec('effects/ripple', 'Broken')]);

      expect(errors).toHaveLength(2);
    });
  });
});
