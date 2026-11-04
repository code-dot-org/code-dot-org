import {
  CheckpointStatusMap,
  Progress,
  isComplete,
  isStarted,
} from '../progress/model';
import {Checkpoint, Pathway} from '../types';

import {PathwayEvidence, isDemonstrated} from './evidence';

/**
 * Computes the status of each checkpoint with routing applied. Complete and
 * in-progress checkpoints come from student progress. Based on the completed
 * checkpoints and the evidence, we skip any checkpoints that are skippable
 * and whose target evidence levels are demonstrated, repeating as each skip
 * unlocks more.
 */
export function routeStatusMap(
  pathway: Pathway,
  progress: Progress,
  evidence: PathwayEvidence
): CheckpointStatusMap {
  const checkpointsById = new Map(pathway.checkpoints.map(c => [c.id, c]));
  const completed = pathway.checkpoints.filter(c => isComplete(c, progress));
  const started = new Set(
    pathway.checkpoints.filter(c => isStarted(c, progress)).map(c => c.id)
  );
  const done = new Set(completed.map(c => c.id));
  // Mark any ancestors of a completed checkpoint done, even if they aren't
  // themselves complete (can happen if target evidence levels change after a
  // student has already completed a later checkpoint).
  for (const checkpoint of completed) {
    for (const id of ancestorsOf(checkpoint, checkpointsById)) done.add(id);
  }
  const unlocked = (c: Checkpoint) =>
    (c.requires || []).every(id => done.has(id));

  const skipped = new Set<string>();
  const skippable = (c: Checkpoint) =>
    !isComplete(c, progress) &&
    !started.has(c.id) &&
    !skipped.has(c.id) &&
    !!c.skippable &&
    unlocked(c) &&
    isDemonstrated(c, evidence);
  let passable = pathway.checkpoints.filter(skippable);
  while (passable.length) {
    for (const c of passable) {
      skipped.add(c.id);
      done.add(c.id);
    }
    passable = pathway.checkpoints.filter(skippable);
  }

  return Object.fromEntries(
    pathway.checkpoints.map(c => {
      if (isComplete(c, progress)) return [c.id, 'complete'];
      if (started.has(c.id)) return [c.id, 'inProgress'];
      if (skipped.has(c.id)) return [c.id, 'skipped'];
      return [c.id, unlocked(c) ? 'available' : 'locked'];
    })
  );
}

/**
 * The first checkpoint, in authored order, that is open to the student: in
 * progress or available.
 */
export function nextCheckpoint(
  pathway: Pathway,
  statusMap: CheckpointStatusMap
): string | undefined {
  return pathway.checkpoints.find(c =>
    ['inProgress', 'available'].includes(statusMap[c.id])
  )?.id;
}

/** Ids of everything a checkpoint requires, through any chain. */
function ancestorsOf(
  checkpoint: Checkpoint,
  checkpointsById: Map<string, Checkpoint>
): Set<string> {
  const seen = new Set<string>();
  const visit = (c: Checkpoint) => {
    for (const id of c.requires || []) {
      if (seen.has(id)) continue;
      seen.add(id);
      const required = checkpointsById.get(id);
      if (required) visit(required);
    }
  };
  visit(checkpoint);
  return seen;
}
