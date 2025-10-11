import {formatUserId} from '@cdo/apps/metrics/statsigHelpers';
import * as utils from '@cdo/apps/utils';

describe('StatsigReporter', () => {
  describe('formatUserId', () => {
    it('prepends environment in test', () => {
      jest.spyOn(utils, 'getEnvironment').mockReturnValue('test');
      expect(formatUserId('0').startsWith('test')).toBe(true);
      utils.getEnvironment.mockRestore();
    });

    it('does not prepend environment in production', () => {
      jest.spyOn(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(formatUserId('0').startsWith('prod')).toBe(false);
      utils.isProductionEnvironment.mockRestore();
    });

    it('formats short user ids to be five character', () => {
      jest.spyOn(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(formatUserId('1')).toBe('00001');
      utils.isProductionEnvironment.mockRestore();
    });

    it('does not change long user ids in production', () => {
      jest.spyOn(utils, 'isProductionEnvironment').mockReturnValue(true);
      expect(formatUserId('88888')).toBe('88888');
      utils.isProductionEnvironment.mockRestore();
    });
  });
});
