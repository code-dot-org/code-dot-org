import {queryParams} from '@cdo/apps/code-studio/utils';
import {EVENTS} from '@cdo/apps/metrics/utils/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/utils/AnalyticsReporter';

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
    analyticsReporter.sendEvent(EVENTS.TEACHER_VIEWING_STUDENT_WORK, {
      ...additionalPayload,
      unitId: appOptions.serverScriptId,
      levelId: appOptions.serverLevelId,
      sectionId: queryParams('section_id'),
    });
  }
};
