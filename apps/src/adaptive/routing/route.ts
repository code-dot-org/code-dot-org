// The router: a pure decision over the pathway, the status of each
// checkpoint and the evidence derived from the student's progress. It
// decides which checkpoints to complete by placement and where to put the
// student next; it never changes anything itself. Every rule here is over
// authored structure, so a decision can be explained and tested without a
// model in the loop.

import {CheckpointStatusMap} from '../progress/model';
import {Checkpoint, Pathway} from '../types';

import {PathwayEvidence, isDemonstrated} from './evidence';

/** What just happened, for the router to react to. */
export type RoutingEvent = {kind: 'checkpointComplete'; checkpointId: string};

/** What the router decided. */
export interface RoutingResult {
  /** Checkpoints completed by placement, in the order they were passed. */
  completedCheckpoints: string[];
  /** The checkpoint to open next, if any is open to the student. */
  nextCheckpoint?: string;
}

/**
 * Determines routing for the student based on their evidence. Starting from
 * the checkpoints already complete or in progress, we pass every available
 * checkpoint that is skippable and whose target evidence levels have been
 * demonstrated, repeating as each pass opens more. Returns the list of
 * completed checkpoints and a checkpoint to open next, if any is available.
 */
export function route(
  pathway: Pathway,
  statusMap: CheckpointStatusMap,
  evidence: PathwayEvidence,
  event: RoutingEvent
): RoutingResult {
  const complete = new Set(
    pathway.checkpoints
      .filter(c => statusMap[c.id] === 'complete')
      .map(c => c.id)
  );
  const inProgress = new Set(
    pathway.checkpoints
      .filter(c => statusMap[c.id] === 'inProgress')
      .map(c => c.id)
  );
  const completedCheckpoints = deriveRoutedCompletions(
    pathway,
    complete,
    inProgress,
    evidence
  );
  const routed = new Set([...complete, ...completedCheckpoints]);
  const nextCheckpoint = pathway.checkpoints.find(
    c => inProgress.has(c.id) || isAvailable(c, routed, inProgress)
  )?.id;
  return {completedCheckpoints, nextCheckpoint};
}

/**
 * Checkpoints passed by placement, in order, including those that each pass
 * makes passable.
 */
function deriveRoutedCompletions(
  pathway: Pathway,
  complete: Set<string>,
  inProgress: Set<string>,
  evidence: PathwayEvidence
): string[] {
  const passable = findPassableCheckpoints(
    pathway,
    complete,
    inProgress,
    evidence
  );
  if (!passable.length) return [];
  return [
    ...passable,
    ...deriveRoutedCompletions(
      pathway,
      new Set([...complete, ...passable]),
      inProgress,
      evidence
    ),
  ];
}

/** Ids of the available checkpoints the student may be placed past: skippable and demonstrated. */
function findPassableCheckpoints(
  pathway: Pathway,
  complete: Set<string>,
  inProgress: Set<string>,
  evidence: PathwayEvidence
): string[] {
  return pathway.checkpoints
    .filter(
      c =>
        c.skippable &&
        isAvailable(c, complete, inProgress) &&
        isDemonstrated(c, evidence)
    )
    .map(c => c.id);
}

/** Open to start: not complete, not in progress, and everything it requires complete. */
function isAvailable(
  checkpoint: Checkpoint,
  complete: Set<string>,
  inProgress: Set<string>
): boolean {
  return (
    !complete.has(checkpoint.id) &&
    !inProgress.has(checkpoint.id) &&
    (checkpoint.requires || []).every(id => complete.has(id))
  );
}
