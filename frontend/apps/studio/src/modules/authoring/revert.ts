import type {CurriculumChange} from '@code-dot-org/authoring';

import type {CurriculumChangeInput} from './api';

/**
 * The compensating forward change that undoes one CurriculumChange, or
 * undefined when that op isn't safely invertible without guessing (the
 * caller should not offer a Revert control for those).
 *
 * Scope, deliberately narrow. insertExperience, createLevel and
 * attachExistingLevel all reduce to "one experience landed in one lesson",
 * so their compensating change is always removeExperience — for
 * attachExistingLevel the resulting experience id is `lb:<levelKey>`
 * (apply.ts's resolveLevel and its unresolved fallback both mint it that
 * way, deterministically, so no id needs recovering from the tree).
 * overrideLevelInstructions restores whatever `previous` the server
 * captured at apply time (see AuthoringState.applyCurriculumChange) — no
 * log replay needed.
 *
 * Excluded, and why: createCourse/createUnit/createLesson may have gained
 * content since (removing the container would silently drop it too);
 * removeCourse and removeExperience don't retain what they deleted;
 * moveExperience doesn't retain the prior position/lesson; updateUnit/
 * updateLesson/updateContent/updateLevel are Partial-patch ops like
 * overrideLevelInstructions but don't (yet) capture a `previous` the same
 * way; createWidget/updateWidgetMetadata mint or edit a widget, not a
 * curriculum placement.
 */
export function buildRevertChangeBody(
  change: CurriculumChange,
): CurriculumChangeInput | undefined {
  switch (change.op) {
    case 'insertExperience':
      return {
        op: 'removeExperience',
        lessonId: change.lessonId,
        experienceId: change.experience.id,
      };
    case 'createLevel':
      return {
        op: 'removeExperience',
        lessonId: change.lessonId,
        experienceId: change.level.id,
      };
    case 'attachExistingLevel':
      return {
        op: 'removeExperience',
        lessonId: change.lessonId,
        experienceId: `lb:${change.levelKey}`,
      };
    case 'overrideLevelInstructions':
      return change.previous
        ? {
            op: 'overrideLevelInstructions',
            experienceId: change.experienceId,
            patch: change.previous,
          }
        : undefined;
    default:
      return undefined;
  }
}
