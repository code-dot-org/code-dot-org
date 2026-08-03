// A `create actor in map` block's placements, saved with the block.
//
// A mutator with no dialog of its own, like `sliderRange`: Blockly reaches
// `saveExtraState` / `loadExtraState` through the mutator seam whether or not
// there is UI behind it, and the UI here is the map canvas the block's `edit…`
// button opens (MAPS.md §4), which writes through `setPlacements` rather than
// reshaping the block.
//
// This is what makes the arrangement part of the `.world` file: extraState is
// serialized with the workspace, so the placements are saved, loaded, copied
// with a duplicated block, and undone by Blockly's own undo.

import {defineMutator} from '@code-dot-org/blockly';

import {EMPTY_PLACEMENTS, type MapPlacementsState} from '../mapPlacements';

export const MAP_PLACEMENTS_MUTATOR = 'map_placements_mutator';

export const mapPlacementsMutator = defineMutator(MAP_PLACEMENTS_MUTATOR, {
  mapPlacements_: {...EMPTY_PLACEMENTS} as MapPlacementsState,

  saveExtraState(): MapPlacementsState {
    return {placements: this.mapPlacements_.placements.map(p => ({...p}))};
  },

  loadExtraState(state: MapPlacementsState): void {
    this.mapPlacements_ = {
      placements: Array.isArray(state?.placements)
        ? state.placements.map(p => ({...p}))
        : [],
    };
  },
});
