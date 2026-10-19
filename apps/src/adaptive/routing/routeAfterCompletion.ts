import {Progress, getStatusMap} from '../progress/model';
import {Checkpoint, Pathway} from '../types';

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
 * Progress with the router's verdict on a checkpoint's completion recorded
 * as `lastRouting`, or unchanged when the checkpoint does not ask for
 * routing. The verdict is not applied.
 */
export function routeAfterCompletion(
  pathway: Pathway,
  progress: Progress,
  checkpoint: Checkpoint
): Progress {
  if (!checkpoint.routeAfterCompletion) return progress;
  const evidence = computeEvidence(pathway, progress);
  const verdict = route(pathway, getStatusMap(pathway, progress), evidence, {
    kind: 'checkpointComplete',
    checkpointId: checkpoint.id,
  });
  return {
    ...progress,
    lastRouting: {checkpointId: checkpoint.id, evidence, verdict},
  };
}
