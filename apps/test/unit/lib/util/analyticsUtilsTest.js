import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import * as utils from '@cdo/apps/code-studio/utils';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {
  reportTeacherReviewingStudentNonLabLevel,
  repackageError,
} from '@cdo/apps/metrics/analyticsUtils';

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

  describe('repackageError', () => {
    it('returns a simplified error object for Error instances', () => {
      const error = new Error('example message');
      error.name = 'ExampleError';

      const repackaged = repackageError(error);

      expect(repackaged).to.deep.include({
        message: error.message,
        name: error.name,
      });
      expect(repackaged.stack).to.equal(error.stack);

      // properties are enumerable
      expect(Object.keys(repackaged)).to.include.members([
        'message',
        'name',
        'stack',
      ]);
    });

    it('returns the original value for non-Error inputs', () => {
      const errorLike = {message: 'failure', code: 400};

      const repackaged = repackageError(errorLike);

      expect(repackaged).to.equal(errorLike);
    });
  });
});
