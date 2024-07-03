import statsigReporter from '@cdo/apps/lib/util/StatsigReporter';
import * as utils from '@cdo/apps/utils';



describe('StatsigReporter', () => {
  describe('formatUserId', () => {
    it('prepends environment in test', () => {
      stub(utils, 'getEnvironment').mockReturnValue('test');
      expect(statsigReporter.formatUserId('0').startsWith('test')).toBe(true);
      utils.getEnvironment.mockRestore();
    });

    it('does not prepend environment in production', () => {
      stub(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(statsigReporter.formatUserId('0').startsWith('prod')).toBe(false);
      utils.isProductionEnvironment.mockRestore();
    });

    it('formats short user ids to be five character', () => {
      stub(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(statsigReporter.formatUserId('1')).toBe('00001');
      utils.isProductionEnvironment.mockRestore();
    });

    it('does not change long user ids in production', () => {
      stub(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(statsigReporter.formatUserId('88888')).toBe('88888');
      utils.isProductionEnvironment.mockRestore();
    });
  });
});
