import {translate} from '../localization';

import {buildUniformValues, createEffectController} from './effectFilter';
import type {
  AppliedEffect,
  EffectParameterValues,
  PhaserNamespace,
  RegisteredEffect,
} from './types';

/**
 * Applying effects to Actors and Worlds.
 *
 * Both go through Phaser's filter list, but from different owners: an Actor
 * filters its own render, while a World filters the whole camera. That is the
 * distinction the `use effect` block makes, and it is the only real difference
 * between these two functions.
 */

/**
 * A Game Object that can carry filters — every Actor in the World lab.
 *
 * `enableFilters` is what populates `filters` and `filterCamera`, so both are
 * optional until it has been called.
 */
type FilterableGameObject = Phaser.GameObjects.GameObject & {
  enableFilters(): unknown;
  readonly filters: Phaser.Types.GameObjects.FiltersInternalExternal | null;
  filterCamera: Phaser.Cameras.Scene2D.Camera;
};

function attach(
  list: Phaser.GameObjects.Components.FilterList,
  controller: ReturnType<typeof createEffectController>,
  effect: RegisteredEffect,
  camera: Phaser.Cameras.Scene2D.Camera,
): AppliedEffect {
  list.add(controller);

  return {
    controller,
    setValues: values => {
      controller.uniformValues = buildUniformValues(effect.compiled, values);
    },
    restart: () => {
      controller.startedAt = camera.scene.time.now;
    },
    remove: () => {
      list.remove(controller);
    },
  };
}

/**
 * Play an effect on one Actor's image.
 *
 * The filter goes in the *internal* list so it is applied to the Actor's own
 * pixels before it is composited into the scene — an underwater wobble on a
 * fish should distort the fish, not the water behind it.
 */
export function applyEffectToActor(
  phaser: PhaserNamespace,
  actor: FilterableGameObject,
  effect: RegisteredEffect,
  values: EffectParameterValues = {},
): AppliedEffect {
  actor.enableFilters();

  const filters = actor.filters;
  if (!filters) {
    throw new Error(
      translate(
        'This Actor cannot take effects — its Game Object has no filter support.',
      ),
    );
  }

  // Filters render through the Game Object's own filter camera, not the
  // scene's main camera, so that is the camera the controller belongs to.
  const camera = actor.filterCamera;
  const controller = createEffectController(phaser, camera, effect, values);
  return attach(filters.internal, controller, effect, camera);
}

/**
 * Play an effect across the whole viewport.
 *
 * Applied to the camera's internal list, so it runs over everything the camera
 * has drawn — the World-wide case from the spec, such as an underwater
 * distortion covering the entire scene.
 */
export function applyEffectToWorld(
  phaser: PhaserNamespace,
  camera: Phaser.Cameras.Scene2D.Camera,
  effect: RegisteredEffect,
  values: EffectParameterValues = {},
): AppliedEffect {
  const controller = createEffectController(phaser, camera, effect, values);
  return attach(camera.filters.internal, controller, effect, camera);
}
