import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import {expect} from '../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('AnalyticsReporter', () => {
  describe('shouldPutRecord', () => {
    it('shouldPutRecord return true if alwaysPut is true', () => {
      const originalLocalMode = analyticsReporter.local_mode;
      analyticsReporter.local_mode = true; // Simulate local mode
      expect(analyticsReporter.shouldPutRecord(true)).to.be.true;
      analyticsReporter.local_mode = originalLocalMode; // Restore
    });

    it('shouldPutRecord returns true if production', () => {
      const originalLocalMode = analyticsReporter.local_mode;
      analyticsReporter.local_mode = false; // Simulate production
      expect(analyticsReporter.shouldPutRecord(false)).to.be.true;
      analyticsReporter.local_mode = originalLocalMode; // Restore
    });

    it('shouldPutRecord returns false if development', () => {
      const originalLocalMode = analyticsReporter.local_mode;
      analyticsReporter.local_mode = true; // Simulate local mode
      expect(analyticsReporter.shouldPutRecord(false)).to.be.false;
      analyticsReporter.local_mode = originalLocalMode; // Restore
    });
  });
});
