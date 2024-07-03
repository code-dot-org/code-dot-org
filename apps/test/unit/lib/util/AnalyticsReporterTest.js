import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import * as utils from '@cdo/apps/utils';



describe('AnalyticsReporter', () => {
  describe('formatUserId', () => {
    it('prepends environment in development', () => {
      stub(utils, 'getEnvironment').mockReturnValue('development');
      expect(analyticsReporter.formatUserId('0').startsWith('development')).toBe(true);
      utils.getEnvironment.mockRestore();
    });

    it('prepends environment in staging', () => {
      stub(utils, 'getEnvironment').mockReturnValue('staging');
      expect(analyticsReporter.formatUserId('0').startsWith('staging')).toBe(true);
      utils.getEnvironment.mockRestore();
    });

    it('prepends environment in test', () => {
      stub(utils, 'getEnvironment').mockReturnValue('test');
      expect(analyticsReporter.formatUserId('0').startsWith('test')).toBe(true);
      utils.getEnvironment.mockRestore();
    });

    it('prepends environment in adhoc', () => {
      stub(utils, 'getEnvironment').mockReturnValue('adhoc');
      expect(analyticsReporter.formatUserId('0').startsWith('adhoc')).toBe(true);
      utils.getEnvironment.mockRestore();
    });

    it('does not prepend environment in production', () => {
      stub(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(analyticsReporter.formatUserId('0').startsWith('prod')).toBe(false);
      utils.isProductionEnvironment.mockRestore();
    });

    it('formats short user ids to be five character', () => {
      stub(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(analyticsReporter.formatUserId('1')).toBe('00001');
      utils.isProductionEnvironment.mockRestore();
    });

    it('does not change long user ids in production', () => {
      stub(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(analyticsReporter.formatUserId('88888')).toBe('88888');
      utils.isProductionEnvironment.mockRestore();
    });
  });

  describe('shouldPutRecord', () => {
    it('shouldPutRecord return true if alwaysPut is true', () => {
      stub(utils, 'getEnvironment').mockReturnValue('development');
      expect(analyticsReporter.shouldPutRecord(true)).toBe(true);
      utils.getEnvironment.mockRestore();
    });

    it('shouldPutRecord returns true if production', () => {
      stub(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(analyticsReporter.shouldPutRecord(false)).toBe(true);
      utils.isProductionEnvironment.mockRestore();
    });

    it('shouldPutRecord returns false if development', () => {
      stub(utils, 'getEnvironment').mockReturnValue('development');
      expect(analyticsReporter.shouldPutRecord(false)).toBe(false);
      utils.getEnvironment.mockRestore();
    });
  });
});
