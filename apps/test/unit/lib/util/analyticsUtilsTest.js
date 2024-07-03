import sinon from 'sinon';

import * as utils from '@cdo/apps/code-studio/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/lib/util/analyticsUtils';



describe('AnalyticsUtils', () => {
  it('reports teacher viewing student work on a dsl level when needed', () => {
    window.appOptions = {
      readonlyWorkspace: true,
      submitted: false,
    };
    const queryParamsSpy = sinon.stub(utils, 'queryParams');
    queryParamsSpy.withArgs('user_id').returns('123');
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

    reportTeacherReviewingStudentNonLabLevel();
    expect(analyticsSpy).toHaveBeenCalled().once;

    utils.queryParams.restore();
    analyticsSpy.restore();
  });
});
