/* global appOptions */
import {queryParams} from '@cdo/apps/code-studio/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

export const reportTeacherReviewingStudentDslLevel = () => {
  if (!appOptions) {
    return;
  }
  if (
    appOptions.readonlyWorkspace &&
    !appOptions.submitted &&
    !!queryParams('user_id')
  ) {
    analyticsReporter.sendEvent(EVENTS.TEACHER_VIEWING_STUDENT_WORK, {
      unitId: appOptions.serverScriptId,
      levelId: appOptions.serverLevelId,
      sectionId: queryParams('section_id')
    });
  }
};
