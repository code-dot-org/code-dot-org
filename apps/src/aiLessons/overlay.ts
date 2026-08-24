// Per-student lesson overlay: the mastery agent's additions to an
// authored lesson.  The authored JSON is shared and immutable; what one
// student's remediation adds lives here — full step definitions plus
// which hub paths they extend — stored per (lesson, user) at
// `overlays/<lessonId>/<userId>.json`, like inputs and progress.
//
// applyOverlay() merges the two into the "effective lesson" the player
// runs.  Generated steps are APPENDED to the steps array — array
// position drives checkpointIndex in progress events and the "Step N of
// M" display, so inserting mid-array would shift authored indexes and
// corrupt event history.  Path continuation routes into them by path
// membership, so their array position never matters for navigation.

import HttpClient from '@cdo/apps/util/HttpClient';

import {normalizeLessonPlan} from './lessonFormat';
import {isHubStep, LessonPlan, Step} from './types';

export interface LessonOverlay {
  // Generated step definitions (they exist nowhere else).  Each should
  // carry `generated: true` and a `gen-<pathId>-…` id.
  steps: Step[];
  // Step ids appended to each hub path, in order.
  pathExtensions: {[pathId: string]: string[]};
  // Remediation rounds consumed per path — the generation cap counter.
  rounds: {[pathId: string]: number};
}

export const EMPTY_OVERLAY: LessonOverlay = {
  steps: [],
  pathExtensions: {},
  rounds: {},
};

function overlayUrl(lessonId: string): string {
  return `/ai_lessons/${encodeURIComponent(lessonId)}/overlay`;
}

export async function loadOverlay(lessonId: string): Promise<LessonOverlay> {
  try {
    const response = await HttpClient.get(overlayUrl(lessonId));
    const raw = (await response.json()) as Partial<LessonOverlay>;
    return {
      steps: Array.isArray(raw.steps) ? raw.steps : [],
      pathExtensions: raw.pathExtensions || {},
      rounds: raw.rounds || {},
    };
  } catch {
    return EMPTY_OVERLAY;
  }
}

export async function saveOverlay(
  lessonId: string,
  overlay: LessonOverlay
): Promise<void> {
  await HttpClient.put(overlayUrl(lessonId), JSON.stringify(overlay), true, {
    'Content-Type': 'application/json',
  });
}

// Merge an overlay into its authored lesson.  Defensive on generated
// content: steps colliding with existing ids are dropped, extensions
// referencing unknown steps are dropped, and the merged plan goes back
// through normalizeLessonPlan so a malformed generated step degrades
// the same way malformed authored JSON does.
export function applyOverlay(
  lesson: LessonPlan,
  overlay: LessonOverlay
): LessonPlan {
  if (overlay.steps.length === 0) return lesson;

  const existingIds = new Set(lesson.steps.map(s => s.id));
  const added = overlay.steps.filter(s => s.id && !existingIds.has(s.id));
  const addedIds = new Set(added.map(s => s.id));

  const steps = [...lesson.steps, ...added].map(step => {
    if (!isHubStep(step)) return step;
    const paths = step.paths.map(p => {
      const extension = (overlay.pathExtensions[p.id] || []).filter(
        id => addedIds.has(id) && !p.steps.includes(id)
      );
      return extension.length > 0
        ? {...p, steps: [...p.steps, ...extension]}
        : p;
    });
    return {...step, paths};
  });

  return normalizeLessonPlan({...lesson, steps});
}
