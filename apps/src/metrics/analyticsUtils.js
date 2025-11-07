import {queryParams} from '@cdo/apps/code-studio/utils';
import {EVENTS, PLATFORMS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

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
    analyticsReporter.sendEvent(
      EVENTS.TEACHER_VIEWING_STUDENT_WORK,
      {
        ...additionalPayload,
        unitId: appOptions.serverScriptId,
        levelId: appOptions.serverLevelId,
        sectionId: queryParams('section_id'),
      },
      PLATFORMS.BOTH
    );
  }
};

// Error instances in javascript have non-enumerable properties so JSON.stringify won't include them.
// Convert Errors to objects with enumerable properties for serialization.
export function repackageError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  return error;
}
