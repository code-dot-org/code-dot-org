// Traces each change the router makes to the map as the student's progress
// moves, with the evidence it read and the judge traces behind that evidence.
// Nothing is traced while adaptive AI is off: the relay refuses users it is
// off for.

import {isAdaptiveAiEnabled} from '../ai/generate';
import {traceDecision} from '../ai/langfuse/trace';
import {
  CheckpointStatus,
  CheckpointStatusMap,
  Progress,
} from '../progress/model';
import {Pathway} from '../types';

import {PathwayEvidence} from './evidence';
import {nextCheckpoint} from './route';

/** Statuses only the router assigns; the student's own work makes the rest. */
const ROUTED_STATUSES: CheckpointStatus[] = ['available', 'skipped'];

export interface RoutingChange {
  pathway: Pathway;
  progress: Progress;
  evidence: PathwayEvidence;
  previous: CheckpointStatusMap;
  current: CheckpointStatusMap;
  levelId: number;
  scriptId: number;
}

/** Traces the change from `previous` to `current` if the router made any of it. */
export function traceRouting({
  pathway,
  progress,
  evidence,
  previous,
  current,
  levelId,
  scriptId,
}: RoutingChange): void {
  if (!isAdaptiveAiEnabled()) return;
  const changed = pathway.checkpoints
    .filter(c => previous[c.id] !== current[c.id])
    .map(c => ({checkpointId: c.id, from: previous[c.id], to: current[c.id]}));
  if (!changed.some(change => ROUTED_STATUSES.includes(change.to))) return;
  traceDecision({
    name: 'adaptive-routing',
    levelId,
    input: {
      previousStatus: previous,
      evidence: withJudgeTraces(evidence, progress),
    },
    output: {
      status: current,
      changed,
      nextCheckpointId: nextCheckpoint(pathway, current),
    },
    metadata: {pathwayId: pathway.id, scriptId},
  });
}

/** The evidence, with each judge's observation naming the trace the judge ran under. */
function withJudgeTraces(evidence: PathwayEvidence, progress: Progress) {
  return Object.fromEntries(
    Object.entries(evidence).map(([skillId, skill]) => [
      skillId,
      {
        ...skill,
        from: skill.from.map(pointer =>
          pointer.kind === 'validation'
            ? {...pointer, traceId: judgeTraceId(progress, pointer)}
            : pointer
        ),
      },
    ])
  );
}

function judgeTraceId(
  progress: Progress,
  {stepId, at}: {stepId: string; at: string}
): string | undefined {
  return progress.steps[stepId]?.validationHistory?.find(
    attempt => attempt.at === at
  )?.traceId;
}
