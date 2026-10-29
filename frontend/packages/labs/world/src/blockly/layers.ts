// The layers a block can name (specs/VIEWPORT.md).
//
// A layer is a map's: made in the map editor and kept in the map, with its
// parallax and background. Code
// places into the default layer, and a block that acts on a layer without
// naming one acts on the layer where it runs (`World.layerHere`). What is
// left here is the dropdown for the blocks that ask about a layer by name.

import type {Blockly} from '@code-dot-org/blockly';

import {DEFAULT_LAYER_ID} from '../engine/core/Layer';

import {liveDropdown, projectLayers} from './moduleOptions';

/** The `[label, value]` rows a LAYER dropdown offers: every map's layers. */
export const layerOptions = (): Array<[string, string]> => {
  const rows = projectLayers();
  return rows.some(([, id]) => id === DEFAULT_LAYER_ID)
    ? rows
    : [['Main', DEFAULT_LAYER_ID], ...rows];
};

/**
 * The runtime layer id a LAYER dropdown's value names: the value itself, or
 * the default for none. A layer a map has since lost is the engine's to
 * resolve, which places into the default (`World.addActor`).
 */
export const layerIdFromValue = (
  _block: Blockly.Block,
  value: string,
): string => value || DEFAULT_LAYER_ID;

/** The factor a layer starts with: all of the camera's motion, both axes. */
export const DEFAULT_PARALLAX = {x: 1, y: 1};

/** The LAYER dropdown, kept live as maps gain and lose layers. */
export const layerOptionsExtension = liveDropdown(
  'world_layer_options',
  'LAYER',
  layerOptions,
);
