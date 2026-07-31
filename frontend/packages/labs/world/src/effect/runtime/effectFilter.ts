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

  const BaseFilterShader = phaser.Renderer.WebGL.RenderNodes.BaseFilterShader;

  class EffectFilterShader extends BaseFilterShader {
    constructor(manager: Phaser.Renderer.WebGL.RenderNodes.RenderNodeManager) {
      super(renderNodeName, manager, undefined, compiled.fragmentSource);
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

  renderer.renderNodes.addNodeConstructor(renderNodeName, EffectFilterShader);

  return {renderNodeName, compiled};
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
