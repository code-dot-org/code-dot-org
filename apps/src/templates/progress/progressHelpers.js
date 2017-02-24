import { ViewType } from '@cdo/apps/code-studio/stageLockRedux';
import { isHiddenForSection } from '@cdo/apps/code-studio/hiddenStageRedux';

/**
 * Used by components to determine whether a particular lesson is hidden or not.
 * viewAs, sectionId, and hiddenStageState all represent state extracted from
 * our redux store.
 * @returns {boolean} True if the provided lesson is hidden
 */
export function lessonIsHidden({lesson, viewAs, sectionId, hiddenStageState}) {
  const isHidden = isHiddenForSection(hiddenStageState, sectionId, lesson.id);
  return isHidden && viewAs !== ViewType.Teacher;
}
