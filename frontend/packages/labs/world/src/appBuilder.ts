// App Builder: a level that is about making an app rather than a game.
//
// A level says so with `levelData.mode: 'app'` (the Notes scenario does), and
// the editor then leaves out what only a game wants: the game rules, the game
// actors, the Enhance rows that make a character, the map's layers and
// cameras, and the blocks that drive them.
//
// LEFT OUT, NOT WITHHELD. A gated lesson withholds a control and says which
// lesson grants it (progression); here there is no lesson behind the missing
// thing, and a control drawn disabled beside nothing would read as broken. So
// the offer goes and nothing replaces it.
//
// OFFERS, NOT FILES. A project that already holds a game rule, a layer or a
// camera still loads, draws and runs as it is, and its blocks still render:
// only the libraries, the toolbox and the map editor's controls narrow. That
// is the same bargain `hiddenToolboxCategories` and the shelf gate make.
//
// ALLOWLISTS, so a rule or actor added to the stock library tomorrow stays out
// of an app until somebody decides it belongs (specs/APPS.md, "App Builder").

import {useMaybeLevelProperties} from '@code-dot-org/lab/contexts';

import {buildsApps, type WorldLevelProperties} from './levelData';

/**
 * The stock rules an app is offered, by `rules/stock` id.
 *
 * Input and the pointer, a finger's gestures, focus moving between fields,
 * screens to go to and back from, the clock, and undo.
 */
export const APP_RULES: ReadonlySet<string> = new Set([
  'input',
  'mouse',
  'gestures',
  'tabNavigation',
  'screens',
  'time',
  'history',
]);

/**
 * The stock actors an app is offered, by `actors/stock` id: the controls.
 *
 * The Speech Box too, which the Interface Kit shows off and which needs only
 * the clock. Not the Health Bar or the Portrait, which are a game's and a
 * story's; not the Viewport, whose import brings the camera rules with it;
 * and none of the game pieces.
 */
export const APP_ACTORS: ReadonlySet<string> = new Set([
  'label',
  'button',
  'toggle',
  'slider',
  'dropdown',
  'textInput',
  'textArea',
  'speechBox',
  'list',
  'progressBar',
  'panel',
  'image',
  'scrollView',
]);

/**
 * The Enhance rows an app is offered, by id. Every other row makes a
 * character — a player, an enemy, a thing that falls or scores.
 */
export const APP_ENHANCEMENTS: ReadonlySet<string> = new Set(['typesOutText']);

/**
 * Blocks the toolbox leaves out of an app: layers, cameras and Viewports.
 *
 * Each is a feature the map editor does not offer an app either, so a block
 * for one would name a thing the learner has no way to make.
 */
export const APP_HIDDEN_BLOCKS: ReadonlySet<string> = new Set([
  // Layers.
  'world_define_layer',
  'world_layer_parallax',
  'world_layer_fixed',
  'world_within_layer',
  'world_add_layer_effect',
  'world_remove_layer_effect',
  // Cameras.
  'world_define_camera',
  'world_use_camera',
  'world_move_camera',
  'world_camera',
  'world_all_cameras',
  'world_add_camera_trait',
  'world_remove_camera_trait',
  'world_this_camera',
  // A map loaded into a Viewport, which an app is not offered.
  'world_load_map_into',
  'world_unload_viewport',
]);

/** Whether this level builds an app, for a component. */
export function useAppBuilder(): boolean {
  return buildsApps(useMaybeLevelProperties<WorldLevelProperties>());
}

/**
 * The same, for code that is not a component.
 *
 * The AI tutor's context is assembled by a plain function, so it reads this
 * seam, which the layout sets as it mounts — the shape `activeCatalogue` uses
 * for the same reason.
 */
let active = false;
export const activeAppBuilder = (): boolean => active;
export const setActiveAppBuilder = (on: boolean): void => {
  active = on;
};

/** Whether a stock rule is offered, in an app or out of one. */
export const offersRule = (id: string, app: boolean): boolean =>
  !app || APP_RULES.has(id);

/** Whether a stock actor is offered. */
export const offersActor = (id: string, app: boolean): boolean =>
  !app || APP_ACTORS.has(id);

/** Whether an Enhance row is offered. */
export const offersEnhancement = (id: string, app: boolean): boolean =>
  !app || APP_ENHANCEMENTS.has(id);
