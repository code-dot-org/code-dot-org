import {Progress} from '../progress/model';
import {Pathway} from '../types';

import {PathwayEvidence, computeEvidence} from './evidence';
import {RoutingResult, route} from './route';

/** One run of the router, kept on progress so the view can react to it. */
export interface RoutingRecord {
  /** The checkpoint whose completion ran the router. */
  checkpointId: string;
  evidence: PathwayEvidence;
  verdict: RoutingResult;
}

/**
 * Marks the checkpoint completed and updates progress. If the checkpoint asks
 * for routing after completion, the router is run and its verdict is recorded
 * on progress. Currently stored only for logging; application comes next.
 */
export function completeCheckpoint(
  pathway: Pathway,
  progress: Progress,
  checkpointId: string
): Progress {
  const completed = progress.completed.includes(checkpointId)
    ? progress
    : {...progress, completed: [...progress.completed, checkpointId]};
  const checkpoint = pathway.checkpoints.find(c => c.id === checkpointId);
  if (!checkpoint?.routeAfterCompletion) return completed;
  const evidence = computeEvidence(pathway, completed.stepContext);
  if (!Object.keys(evidence).length) return completed;
  const verdict = route(pathway, completed, evidence, {
    kind: 'checkpointComplete',
    checkpointId,
  });
  return {...completed, lastRouting: {checkpointId, evidence, verdict}};
}
