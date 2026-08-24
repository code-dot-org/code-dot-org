import DCDO from '@cdo/apps/dcdo';
import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

describe('StatsigReporter', () => {
  describe('shouldPutRecord', () => {
    let originalReady;
    let originalLocalMode;

    beforeEach(() => {
      originalReady = statsigReporter.ready;
      originalLocalMode = statsigReporter.local_mode;
      // A transmitting environment, so the switch is the only thing under test.
      statsigReporter.ready = true;
      statsigReporter.local_mode = false;
    });

    afterEach(() => {
      statsigReporter.ready = originalReady;
      statsigReporter.local_mode = originalLocalMode;
      DCDO.reset();
    });

    it('transmits when statsig-enabled is true', () => {
      DCDO.set('statsig-enabled', true);
      expect(statsigReporter.shouldPutRecord(false)).to.be.true;
    });

    it('transmits when statsig-enabled is absent', () => {
      expect(statsigReporter.shouldPutRecord(false)).to.be.true;
    });

    it('does not transmit when statsig-enabled is false', () => {
      DCDO.set('statsig-enabled', false);
      expect(statsigReporter.shouldPutRecord(false)).to.be.false;
    });

    it('does not transmit when statsig-enabled is false, even with alwaysPut', () => {
      DCDO.set('statsig-enabled', false);
      expect(statsigReporter.shouldPutRecord(true)).to.be.false;
    });
  });
});
