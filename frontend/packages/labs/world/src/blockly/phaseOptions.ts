// Which named moments of the frame a step may run in (engine/core/phases).
//
// The list a step is offered depends on where it is written. Declared under a
// trait, the step knows its subject — so a camera trait is offered the camera's
// moments and never sees `push`, which is not a thing a camera does. Declared
// beside the rule it has no subject, and is offered all of them: reading the
// keyboard and walking every pair of bodies are real work that fits no single
// actor.
//
// The filtering is a consequence of the declaration site rather than a rule
// anyone maintains, which is the same arrangement `use trait` already uses
// (`traitSubjectFor`). It is why the step block belongs UNDER `define trait`
// and not beside it wearing a subject dropdown: position already says it.

import type {Blockly, Extension} from '@code-dot-org/blockly';

import {PHASES, phasesFor, type PhaseSubject} from '../engine/core/phases';

import {liveDropdown} from './moduleOptions';
import {traitSubjectFor} from './traitOptions';

/** The block that carries a subject-scoped step; see `phaseSubjectFor`. */
export const TRAIT_STEP_BLOCK = 'world_trait_step';

/**
 * What a step's phase list should be about.
 *
 * Only a trait-scoped step has a subject. A rule-level one gets `world`, which
 * is not a filter — it offers every moment.
 */
export function phaseSubjectFor(field?: {
  getSourceBlock(): unknown;
}): PhaseSubject {
  const block = field?.getSourceBlock() as {type?: string} | null | undefined;
  return block?.type === TRAIT_STEP_BLOCK ? traitSubjectFor(field) : 'world';
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
);
