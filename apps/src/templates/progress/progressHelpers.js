import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { isHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';

/**
 * This is conceptually similar to being a selector, except that it operates on
 * the entire store state. It isu sed by components to determine whether a
 * particular lesson is hidden or not.
 * @param {number} lessonid - id of the lesson we're querying
 * @param {object} state - State of our entire redux store
 * @param {ViewType?} viewAs - Optional param to determine whether the lesson
 *   would be visible if viewing as someone else
 * @returns {boolean} True if the provided lesson is hidden
 */
export function lessonIsHidden(lesson, state, viewAs) {
  if (!viewAs) {
    viewAs = state.stageLock.viewAs;
  }

  const hiddenStageState = state.hiddenStage;
  const sectionId = state.sections.selectedSectionId;

  const isHidden = isHiddenForSection(hiddenStageState, sectionId, lesson.id);
  return isHidden && viewAs !== ViewType.Teacher;
}
