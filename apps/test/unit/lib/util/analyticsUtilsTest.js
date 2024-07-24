import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as utils from '@cdo/apps/code-studio/utils';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {reportTeacherReviewingStudentNonLabLevel} from '@cdo/apps/lib/util/analyticsUtils';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    expect(analyticsSpy).to.be.called.once;

    utils.queryParams.restore();
    analyticsSpy.restore();
  });
});
