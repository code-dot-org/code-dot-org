import {queryParams} from '@cdo/apps/code-studio/utils';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import harness from '@cdo/apps/lib/util/harness';

export const reportTeacherReviewingStudentNonLabLevel = (
  additionalPayload = {}
) => {
  if (!appOptions) {
    return;
  }
  if (
    appOptions.readonlyWorkspace &&
    !appOptions.submitted &&
    !appOptions.isCodeReviewing &&
    !!queryParams('user_id')
  ) {
    harness.trackAnalytics(EVENTS.TEACHER_VIEWING_STUDENT_WORK, {
      ...additionalPayload,
      unitId: appOptions.serverScriptId,
      levelId: appOptions.serverLevelId,
      sectionId: queryParams('section_id'),
    });
  }
};
