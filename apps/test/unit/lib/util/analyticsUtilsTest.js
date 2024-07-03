import * as utils from '@cdo/apps/code-studio/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/lib/util/analyticsUtils';



describe('AnalyticsUtils', () => {
  it('reports teacher viewing student work on a dsl level when needed', () => {
    window.appOptions = {
      readonlyWorkspace: true,
      submitted: false,
    };
    const queryParamsSpy = jest.spyOn(utils, 'queryParams').mockClear().mockImplementation();
    queryParamsSpy.mockImplementation((...args) => {
      if (args[0] === 'user_id') {
        return '123';
      }
    });
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

    reportTeacherReviewingStudentNonLabLevel();
    expect(analyticsSpy).toHaveBeenCalled().once;

    utils.queryParams.mockRestore();
    analyticsSpy.mockRestore();
  });
});
