import { fullyLockedStageMapping } from '@cdo/apps/code-studio/stageLockRedux';
import { ViewType } from '@cdo/apps/code-studio/viewAsRedux';
import { isStageHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';
import { LevelStatus, LevelKind } from '@cdo/apps/util/sharedConstants';

/**
 * This is conceptually similar to being a selector, except that it operates on
 * the entire store state. It is used by components to determine whether a
 * particular lesson is visible, or hidden entirely.
 * @param {number} lesson - the lesson we're querying
 * @param {object} state - State of our entire redux store
 * @param {ViewType} viewAs - Are we interested in whether the lesson is viewable
 *   for students or teachers
 * @returns {boolean} True if the provided lesson is visible
 */
export function lessonIsVisible(lesson, state, viewAs) {
  if (!viewAs) {
    throw new Error('missing param viewAs in lessonIsVisible');
  }

  // Don't show stage if not authorized to see lockable
  if (lesson.lockable && !state.stageLock.lockableAuthorized) {
    return false;
  }

  const hiddenStageState = state.hiddenStage;
  const sectionId = state.teacherSections.selectedSectionId;

  const isHidden = isStageHiddenForSection(hiddenStageState, sectionId, lesson.id);
  return !isHidden || viewAs === ViewType.Teacher;
}

/**
 * Check to see if a stage/lesson is locked for all stages in the current section
 * or not. If called as a student, this should always return false since they
 * don't have a selected section.
 * @param {number} lessonId - Id representing the stage/lesson we're curious about
 * @param {object} state - State of our entire redux store
 * @returns {boolean} True if the given lesson is locked for all students in the
 *   currently selected section.
 */
export function lessonIsLockedForAllStudents(lessonId, state) {
  const currentSectionId = state.teacherSections.selectedSectionId;
  const currentSection = state.stageLock.stagesBySectionId[currentSectionId];
  const fullyLockedStages = fullyLockedStageMapping(currentSection);
  return !!fullyLockedStages[lessonId];
}

/**
 * @param {level[]} levels - A set of levels for a given stage
 * @returns {boolean} True if we should consider the stage to be locked for the
 *   current user.
 */
export function stageLocked(levels) {
  // For lockable stages, there is a requirement that they have exactly one LevelGroup,
  // and that it be the last level in the stage. Because LevelGroup's can have
  // multiple "pages", and single LevelGroup might appear as multiple levels/bubbles
  // on the client. However, it is the case that each page in the LG should have
  // an identical locked/unlocked state.
  // Given this, we should be able to look at the last level in our collection
  // to determine whether the LG (and thus the stage) should be considered locked.
  return levels[levels.length - 1].status === LevelStatus.locked;
}

/**
 * @returns A friendly name for the icon name (that can be passed to FontAwesome)
 *   for the given level.
 */
export function getIconForLevel(level) {
  if (level.icon) {
    // Eventually I'd like to have dashboard return an icon type. For now, I'm just
    // going to treat the css class it sends as a type, and map it to an icon name.
    const match = /fa-(.*)/.exec(level.icon);
    if (!match || !match[1]) {
      throw new Error('Unknown iconType: ' + level.icon);
    }
    return match[1];
  }

  if (level.isUnplugged) {
    return 'scissors';
  }

  // default to desktop
  return 'desktop';
}

/**
 * Summarizes stage progress data.
 * @param {[]} levelsWithStatus An array of objects each representing
 * students progress in a level
 * @returns {object} An object with a total count of levels in each of the
 * following buckets: total, completed, imperfect, incomplete, attempted.
 */
export function summarizeProgressInStage(levelsWithStatus) {
  // Get counts of statuses
  let statusCounts = {
    total: levelsWithStatus.length,
    completed: 0,
    imperfect: 0,
    incomplete: 0,
    attempted: 0,
  };
  for (let i = 0; i <levelsWithStatus.length; i++) {
    const status = levelsWithStatus[i].status;
    switch (status) {
      case LevelStatus.perfect:
      case LevelStatus.submitted:
        statusCounts.completed = statusCounts.completed + 1;
        break;
      case LevelStatus.not_tried:
        statusCounts.incomplete = statusCounts.incomplete + 1;
        break;
      case LevelStatus.attempted:
        statusCounts.incomplete = statusCounts.incomplete + 1;
        statusCounts.attempted = statusCounts.attempted + 1;
        break;
      case LevelStatus.passed:
        statusCounts.imperfect = statusCounts.imperfect + 1;
        break;
      // All others are assumed to be not tried
      default:
        statusCounts.incomplete = statusCounts.incomplete + 1;
    }

  }
  return statusCounts;
}

/**
 * The level object passed down to use via the server (and stored in stage.stages.levels)
 * contains more data than we need. This filters to the parts our views care about.
 */
export const processedLevel = (level) => {
  return {
    url: level.url,
    name: level.name,
    progression: level.progression,
    kind: level.kind,
    icon: level.icon,
    isUnplugged: level.kind === LevelKind.unplugged,
    levelNumber: level.kind === LevelKind.unplugged ? undefined : level.title,
    isConceptLevel: level.is_concept_level,
  };
};
