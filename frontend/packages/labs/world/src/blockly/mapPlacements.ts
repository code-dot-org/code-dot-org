// The placements a `create actor in map` block carries.
//
// A map that lives in the world rather than beside it (MAPS.md §1): the
// arrangement of a world's own actors is part of that world, so it rides in the
// block's `extraState` and is saved with the `.world` file. One block, one actor
// type, its own placements — delete the block and exactly its actors go with it.
//
// The entries omit `type`: the block's ACTOR field says which actor these are,
// and storing it twice is storing it wrong. The generator supplies it, and so
// does the popup when it hands the list to the map canvas.

import type {Blockly} from '@code-dot-org/blockly';

import type {Placement} from '../mapEditor/mapModel';

/** One placement, as the block stores it: an id and its overrides. */
export interface MapPlacement {
  id: string;
  /** Per-instance overrides, keyed by owner (trait) id then property id. */
  properties?: Record<string, Record<string, unknown>>;
}

/** What a `create actor in map` block saves and loads. */
export interface MapPlacementsState {
  placements: MapPlacement[];
}

/** A block carrying placements — the mutator's own state, by its field name. */
interface WithPlacements {
  mapPlacements_?: MapPlacementsState;
}

export const EMPTY_PLACEMENTS: MapPlacementsState = {placements: []};

/** The placements on a block, or none for a block that has never been edited. */
export function placementsOf(block: Blockly.Block | undefined): MapPlacement[] {
  const state = (block as (Blockly.Block & WithPlacements) | undefined)
    ?.mapPlacements_;
  return state?.placements ?? [];
}

/** Replace a block's placements. */
export function setPlacements(
  block: Blockly.Block,
  placements: MapPlacement[],
): void {
  (block as Blockly.Block & WithPlacements).mapPlacements_ = {
    placements: placements.map(placement => ({...placement})),
  };
}

/**
 * A placement's instance id in the running world.
 *
 * Prefixed with the block's id because it must be unique across the world and
 * two blocks may each have a `c1` — and stable across rebuilds, because that is
 * what lets the reconciler tell "the same actor moved" from "a different actor"
 * (MAPS.md §3).
 */
export const instanceId = (blockId: string, placementId: string): string =>
  `${blockId}:${placementId}`;

/**
 * The block's placements as the map canvas wants them: with the type on each.
 *
 * The canvas draws an actor by its type and looks its schema up by the same
 * string, so the type it is given here is the one a placed actor will carry.
 */
export const asMapActors = (
  placements: readonly MapPlacement[],
  type: string,
): Placement[] =>
  placements.map(placement => ({...placement, type}) as Placement);

/** The reverse: what the canvas hands back, minus the type it already knew. */
export const asPlacements = (actors: readonly Placement[]): MapPlacement[] =>
  actors.map(({id, properties}) => (properties ? {id, properties} : {id}));
