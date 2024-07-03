import {stub} from 'sinon'; // eslint-disable-line no-restricted-imports

import statsigReporter from '@cdo/apps/lib/util/StatsigReporter';
import * as utils from '@cdo/apps/utils';

// eslint-disable-line no-restricted-imports

describe('StatsigReporter', () => {
  describe('formatUserId', () => {
    it('prepends environment in test', () => {
      stub(utils, 'getEnvironment').returns('test');
      expect(statsigReporter.formatUserId('0').startsWith('test')).toBe(true);
      utils.getEnvironment.restore();
    });

    it('does not prepend environment in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(statsigReporter.formatUserId('0').startsWith('prod')).toBe(false);
      utils.isProductionEnvironment.restore();
    });

    it('formats short user ids to be five character', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(statsigReporter.formatUserId('1')).toBe('00001');
      utils.isProductionEnvironment.restore();
    });

    it('does not change long user ids in production', () => {
      stub(utils, 'isProductionEnvironment').returns(true);
      expect(statsigReporter.formatUserId('88888')).toBe('88888');
      utils.isProductionEnvironment.restore();
    });
  });
});
