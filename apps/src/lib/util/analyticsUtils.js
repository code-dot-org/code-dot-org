import {queryParams} from '@cdo/apps/code-studio/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

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

// sampingRate is a number between 0 and 1 inclusive.
// If samplingRate=0, always returns false.
// If samplingRate=1, always returns true because Math.random() returns a number in range [0,1).
export const isSampling = samplingRate => {
  return samplingRate === 0 ? false : Math.random() <= samplingRate;
};
