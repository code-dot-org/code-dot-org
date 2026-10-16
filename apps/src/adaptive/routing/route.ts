// The router: a pure decision over the pathway, the student's progress and
// the evidence derived from it. It decides which checkpoints to complete by
// placement and where to put the student next; it never changes anything
// itself. Every rule here is over authored structure, so a decision can be
// explained and tested without a model in the loop.

import {Progress, checkpointStatus} from '../progress/model';
import {Pathway} from '../types';

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
 * their current progress, we compute all checkpoints whose target evidence
 * level has been demonstrated and are skippable. Returns the list of completed
 * checkpoints and a checkpoint to open next, if any is available.
 */
export function route(
  pathway: Pathway,
  progress: Progress,
  evidence: PathwayEvidence,
  event: RoutingEvent
): RoutingResult {
  const routedProgress = deriveRoutedProgress(pathway, progress, evidence);
  const completedCheckpoints = routedProgress.completed.slice(
    progress.completed.length
  );
  const nextCheckpoint = pathway.checkpoints.find(c => {
    const status = checkpointStatus(c, routedProgress);
    return status === 'available' || status === 'inProgress';
  })?.id;
  return {completedCheckpoints, nextCheckpoint};
}

/**
 * Progress with every passable checkpoint passed, including those that each
 * pass makes passable.
 */
function deriveRoutedProgress(
  pathway: Pathway,
  progress: Progress,
  evidence: PathwayEvidence
): Progress {
  const passable = findPassableCheckpoints(pathway, progress, evidence);
  if (!passable.length) return progress;
  return deriveRoutedProgress(
    pathway,
    {...progress, completed: [...progress.completed, ...passable]},
    evidence
  );
}

/** Ids of the available checkpoints the student may be placed past: skippable and demonstrated. */
function findPassableCheckpoints(
  pathway: Pathway,
  progress: Progress,
  evidence: PathwayEvidence
): string[] {
  return pathway.checkpoints
    .filter(
      c =>
        c.skippable &&
        checkpointStatus(c, progress) === 'available' &&
        isDemonstrated(c, evidence)
    )
    .map(c => c.id);
}
