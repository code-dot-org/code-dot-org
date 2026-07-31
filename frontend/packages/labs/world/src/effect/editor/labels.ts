import {translate} from '../localization';
import {parameterIdFromNodeId} from '../model/constants';
import type {EffectGhost} from '../nodes/ghosts';
import type {EffectNodeDefinition, EffectPortDefinition} from '../nodes/types';

/**
 * Display names for graph things, translation-aware.
 *
 * The data layer stays English — node definitions, ghosts, and `.effect`
 * files never change with locale. These helpers are the one place that
 * decides what is *ours* to translate and what is the learner's: stock labels
 * go through `translate`, user-authored names (functions and their inputs,
 * parameters) pass through untouched.
 */

/** A node's title. Function nodes carry the learner's own name. */
export function nodeDisplayLabel(definition: EffectNodeDefinition): string {
  return definition.category === 'function'
    ? definition.label
    : translate(definition.label);
}

/** A node's description, for tooltips. */
export function nodeDisplayDescription(
  definition: EffectNodeDefinition,
): string {
  return definition.category === 'function'
    ? definition.description
    : translate(definition.description);
}

/** A port's name. Function-node ports are the learner's input names. */
export function portDisplayLabel(
  definition: EffectNodeDefinition,
  port: EffectPortDefinition,
): string {
  return definition.category === 'function'
    ? port.label
    : translate(port.label);
}

/** A row knob's name. Parameter ghosts carry the learner's own name. */
export function ghostDisplayLabel(ghost: EffectGhost): string {
  return parameterIdFromNodeId(ghost.id) !== null
    ? ghost.label
    : translate(ghost.label);
}
