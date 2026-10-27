// Which named moments of the frame a step may run in (engine/core/phases).
//
// A block offers what its subject takes part in. `each frame` is an actor's
// own work, so it is offered an actor's moments and never sees a camera's. A
// rule's steps are chosen on their page in the Rule Editor (`ruleSteps`).

import type {Blockly, Extension} from '@code-dot-org/blockly';

import {PHASES, phasesFor, type PhaseSubject} from '../engine/core/phases';

import {liveDropdown} from './moduleOptions';

/** The block that carries a subject-scoped step; see `phaseSubjectFor`. */
export const TRAIT_STEP_BLOCK = 'world_trait_step';

/**
 * What a step's phase list should be about: an actor's, for `each frame`, and
 * every moment for anything else, which is not a filter.
 */
export function phaseSubjectFor(field?: {
  getSourceBlock(): unknown;
}): PhaseSubject {
  const block = field?.getSourceBlock() as {type?: string} | null | undefined;
  return block?.type === TRAIT_STEP_BLOCK ? 'actor' : 'world';
}

/** The `PHASE` dropdown's rows: the label a learner reads, and the phase id. */
export function phaseOptions(
  field?: Blockly.FieldDropdown,
): Array<[string, string]> {
  return phasesFor(phaseSubjectFor(field)).map(phase => [phase.name, phase.id]);
}

/**
 * A phase's own description, for the block's tooltip.
 *
 * Static text cannot say it: the same block means "add to velocity" in `push`
 * and "clamp the view" in `confine`, and a learner choosing between twelve
 * words needs each one to say what it is for.
 */
export const phaseSummary = (id: string): string =>
  PHASES.find(phase => phase.id === id)?.summary ?? '';

/** Make a block's `PHASE` dropdown reflect the moments its subject takes part in. */
export const phaseOptionsExtension: Extension = liveDropdown(
  'world_phase_options',
  'PHASE',
  phaseOptions,
  // The lab's own vocabulary — `settle`, `react`, `choose the camera` — and
  // not the name of anything in the project, so it is read in the reader's
  // language like every other word on a block.
  {words: true},
);
