// Prototype progress store. Lives in localStorage only; nothing reaches the
// server. Keyed by pathway id so two pathways do not share state.

import {useCallback, useEffect, useState} from 'react';

import {
  DEFAULT_PROJECT_DESCRIPTION,
  DEFAULT_PROJECT_TITLE,
} from './sampleProject';
import {AbilityGrant, Checkpoint, Pathway} from './types';

export type CheckpointStatus =
  | 'locked'
  | 'available'
  | 'inProgress'
  | 'complete';

export const STATUS_LABELS: {[status in CheckpointStatus]: string} = {
  locked: 'Locked',
  available: 'Ready to start',
  inProgress: 'In progress',
  complete: 'Complete',
};

/** The student's own name and description for their project. */
export interface ProjectMeta {
  title: string;
  description: string;
}

export interface Progress {
  completed: string[];
  started: string[];
  project: ProjectMeta;
}

const EMPTY: Progress = {
  completed: [],
  started: [],
  project: {
    title: DEFAULT_PROJECT_TITLE,
    description: DEFAULT_PROJECT_DESCRIPTION,
  },
};

const storageKey = (pathwayId: string) =>
  `adaptive-prototype-progress:${pathwayId}`;

function load(pathwayId: string): Progress {
  try {
    const raw = window.localStorage.getItem(storageKey(pathwayId));
    if (!raw) return EMPTY;
    const stored = JSON.parse(raw);
    return {
      ...EMPTY,
      ...stored,
      project: {...EMPTY.project, ...stored.project},
    };
  } catch {
    return EMPTY;
  }
}

export function useProgress(pathwayId: string) {
  const [progress, setProgress] = useState<Progress>(() => load(pathwayId));

  useEffect(() => {
    try {
      window.localStorage.setItem(
        storageKey(pathwayId),
        JSON.stringify(progress)
      );
    } catch {
      // Storage unavailable: progress lasts for this page load only.
    }
  }, [pathwayId, progress]);

  const markStarted = useCallback((id: string) => {
    setProgress(p =>
      p.started.includes(id) ? p : {...p, started: [...p.started, id]}
    );
  }, []);

  const markComplete = useCallback((id: string) => {
    setProgress(p =>
      p.completed.includes(id) ? p : {...p, completed: [...p.completed, id]}
    );
  }, []);

  const editProject = useCallback((patch: Partial<ProjectMeta>) => {
    setProgress(p => ({...p, project: {...p.project, ...patch}}));
  }, []);

  const reset = useCallback(() => setProgress(EMPTY), []);

  return {progress, markStarted, markComplete, editProject, reset};
}

export function checkpointStatus(
  checkpoint: Checkpoint,
  progress: Progress
): CheckpointStatus {
  if (progress.completed.includes(checkpoint.id)) return 'complete';
  const unlocked = (checkpoint.requires || []).every(r =>
    progress.completed.includes(r)
  );
  if (!unlocked) return 'locked';
  return progress.started.includes(checkpoint.id) ? 'inProgress' : 'available';
}

/** Ability ids unlocked by the completed checkpoints. */
export function unlockedAbilityIds(
  pathway: Pathway,
  progress: Progress
): string[] {
  return pathway.checkpoints
    .filter(c => progress.completed.includes(c.id))
    .flatMap(c => c.unlocks || []);
}

/** The checkpoint whose completion unlocks an ability, if any. */
export function unlockingCheckpoint(
  pathway: Pathway,
  abilityId: string
): Checkpoint | undefined {
  return pathway.checkpoints.find(c => c.unlocks?.includes(abilityId));
}

export type CapabilityState = {
  [grant in AbilityGrant]?: {unlocked: boolean; unlockedBy?: string};
};

/**
 * Which lab features are on. A feature nothing grants is absent, and callers
 * treat that as on. Inside a checkpoint, its own unlocks count as available
 * so the student can practice what the checkpoint teaches.
 */
export function capabilityState(
  pathway: Pathway,
  progress: Progress,
  current?: Checkpoint
): CapabilityState {
  const available = new Set([
    ...unlockedAbilityIds(pathway, progress),
    ...(current?.unlocks || []),
  ]);
  const state: CapabilityState = {};
  for (const ability of Object.values(pathway.abilities)) {
    if (!ability.grants) continue;
    state[ability.grants] = {
      unlocked: available.has(ability.id),
      unlockedBy: unlockingCheckpoint(pathway, ability.id)?.title,
    };
  }
  return state;
}

export function statusMap(
  pathway: Pathway,
  progress: Progress
): {[id: string]: CheckpointStatus} {
  return Object.fromEntries(
    pathway.checkpoints.map(c => [c.id, checkpointStatus(c, progress)])
  );
}
