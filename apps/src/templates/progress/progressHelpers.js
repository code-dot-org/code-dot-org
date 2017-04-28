import { ViewType, fullyLockedStageMapping } from '@cdo/apps/code-studio/stageLockRedux';
import { isHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';

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
  const sectionId = state.sections.selectedSectionId;

  const isHidden = isHiddenForSection(hiddenStageState, sectionId, lesson.id);
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
  const currentSectionId = state.sections.selectedSectionId;
  const currentSection = state.stageLock.stagesBySectionId[currentSectionId];
  const fullyLockedStages = fullyLockedStageMapping(currentSection);
  return !!fullyLockedStages[lessonId];
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
