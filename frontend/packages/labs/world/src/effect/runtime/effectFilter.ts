import type {CompiledEffect} from '../compiler/types';
import {
  UNIFORM_EFFECT_TIME,
  UNIFORM_RESOLUTION,
  UNIFORM_TIME,
} from '../glsl/symbols';
import {translate} from '../localization';

import type {
  EffectFilterController,
  EffectParameterValues,
  PhaserNamespace,
  RegisteredEffect,
} from './types';

/**
 * Phaser 4 integration.
 *
 * A custom filter in Phaser 4 is two objects: a *render node* that owns the
 * shader program and a *controller* that carries the per-use state. Both are
 * built here at runtime against the caller's Phaser namespace, because the
 * shader source is generated per effect and there is nothing to declare ahead
 * of time.
 *
 * @see https://docs.phaser.io/phaser/concepts/filters
 */

/**
 * Normalize a supplied value to what `programManager.setUniform` accepts.
 *
 * Booleans are accepted for switch parameters — `{glow: true}` reads better in
 * a game than `{glow: 1}` — and become the 1.0 or 0.0 the float uniform wants.
 */
function toUniformValue(
  value: number | boolean | readonly number[],
): number | number[] {
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return typeof value === 'number' ? value : [...value];
}

/** Parameter values by uniform name, defaults filled in for anything missing. */
export function buildUniformValues(
  compiled: CompiledEffect,
  values: EffectParameterValues = {},
): Map<string, number | number[]> {
  const uniforms = new Map<string, number | number[]>();
  for (const parameter of compiled.parameters) {
    const supplied = values[parameter.parameterId];
    uniforms.set(
      parameter.name,
      toUniformValue(supplied ?? parameter.defaultValue),
    );
  }
  return uniforms;
}

/**
 * Register a compiled effect's shader as a render node.
 *
 * Render nodes are keyed by name on the renderer, so the same effect applied
 * to twenty Actors compiles and uploads one program. Re-registering the same
 * name replaces the constructor, which is what makes live editing work.
 */
export function registerEffect(
  phaser: PhaserNamespace,
  scene: Phaser.Scene,
  name: string,
  compiled: CompiledEffect,
): RegisteredEffect {
  const renderNodeName = `EffectShader.${name}`;
  // The registration is built first so the shader class can close over it and
  // read `compiled` at CONSTRUCTION time. A node is built lazily, on the first
  // draw that uses it, which may be after the effect was edited — reading the
  // source captured here at registration would silently resurrect the version
  // the learner has already replaced.
  const registered: RegisteredEffect = {renderNodeName, compiled, version: 0};

  const BaseFilterShader = phaser.Renderer.WebGL.RenderNodes.BaseFilterShader;

  class EffectFilterShader extends BaseFilterShader {
    constructor(manager: Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager) {
      super(
        renderNodeName,
        manager,
        undefined,
        registered.compiled.fragmentSource,
      );
    }

    override setupUniforms(
      controller: Phaser.Filters.Controller,
      drawingContext: Phaser.Renderer.WebGL.DrawingContext,
    ): void {
      const effectController = controller as unknown as EffectFilterController;
      const {programManager} = this;

      const now = controller.camera.scene.time.now;
      programManager.setUniform(UNIFORM_TIME, now / 1000);
      programManager.setUniform(
        UNIFORM_EFFECT_TIME,
        (now - effectController.startedAt) / 1000,
      );
      programManager.setUniform(UNIFORM_RESOLUTION, [
        drawingContext.width,
        drawingContext.height,
      ]);

      for (const [uniform, value] of effectController.uniformValues) {
        programManager.setUniform(uniform, value);
      }
    }
  }

  // `renderNodes` only exists on the WebGL renderer; the Canvas fallback has
  // no shaders to register and no way to run an effect.
  const renderer = scene.game.renderer;
  if (!('renderNodes' in renderer)) {
    throw new Error(
      translate(
        'Effects need the WebGL renderer; this game is running on Canvas.',
      ),
    );
  }

  // Throws if the name is already registered — Phaser has no replace. That is
  // why editing an effect swaps the shader on the existing node
  // (`updateEffect`) instead of registering it again.
  renderer.renderNodes.addNodeConstructor(renderNodeName, EffectFilterShader);

  return registered;
}

/**
 * Replace a registered effect's shader in place, keeping every filter that is
 * already using it.
 *
 * This is what makes editing a `.effect` update a running game rather than
 * restarting it. The obvious route — registering the effect again under the
 * same name — does not work: `addNodeConstructor` *throws* when the name is
 * taken, and even if it did not, the manager caches the constructed node and
 * would never build a second one.
 *
 * So the node stays and its shader is swapped underneath.
 * `ProgramManager.setBaseShader` rewrites the current config, and the program
 * is looked up by a key derived from that config — so a changed source (and a
 * changed name, since two versions of one effect must not collide in the
 * program cache) yields a freshly compiled program on the next draw. Filters
 * hold the node by *name*, so every controller already attached picks up the
 * new program without being touched.
 *
 * The caller is responsible for the controllers' uniform values: a new graph
 * may declare different parameters, and `buildUniformValues` has to be re-run
 * against the new descriptors.
 *
 * @returns the same `RegisteredEffect`, now carrying the new compilation
 */
export function updateEffect(
  scene: Phaser.Scene,
  effect: RegisteredEffect,
  compiled: CompiledEffect,
): RegisteredEffect {
  const renderer = scene.game.renderer;
  if (!('renderNodes' in renderer)) {
    throw new Error(
      translate(
        'Effects need the WebGL renderer; this game is running on Canvas.',
      ),
    );
  }
  const node = renderer.renderNodes.getNode(effect.renderNodeName) as
    | (Phaser.Renderer.WebGL.RenderNodes.BaseFilterShader & {
        programManager: {
          currentConfig: {base: {name: string; vertexShader: string}};
          setBaseShader: (
            name: string,
            vertexShader: string,
            fragmentShader: string,
          ) => void;
        };
      })
    | null;
  if (!node) {
    // Nothing has drawn with this effect yet, so no node was ever constructed.
    // The next draw builds it from the constructor, which closes over the
    // compilation the caller is about to store — nothing to swap.
    effect.compiled = compiled;
    return effect;
  }

  const {programManager} = node;
  const base = programManager.currentConfig.base;
  programManager.setBaseShader(
    // A distinct name per version: the program cache is keyed off this, and
    // reusing it would hand back the previous compile.
    `${effect.renderNodeName}#${effect.version + 1}`,
    // The vertex side is Phaser's own filter vertex shader and does not change.
    base.vertexShader,
    compiled.fragmentSource,
  );

  effect.compiled = compiled;
  effect.version += 1;
  return effect;
}

/** Build the controller class for a registered effect. */
export function createEffectController(
  phaser: PhaserNamespace,
  camera: Phaser.Cameras.Scene2D.Camera,
  effect: RegisteredEffect,
  values: EffectParameterValues = {},
): Phaser.Filters.Controller & EffectFilterController {
  class EffectController extends phaser.Filters.Controller {
    effect = effect;
    uniformValues = buildUniformValues(effect.compiled, values);
    startedAt = camera.scene.time.now;

    constructor() {
      super(camera, effect.renderNodeName);
    }
  }

  return new EffectController() as Phaser.Filters.Controller &
    EffectFilterController;
}
