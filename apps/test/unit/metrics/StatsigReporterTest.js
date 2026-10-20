import {StatsigClient} from '@statsig/js-client';

import {findOrCreateStableId} from '@cdo/apps/metrics/statsigHelpers';
import statsigReporter from '@cdo/apps/metrics/StatsigReporter';

jest.mock('@statsig/js-client', () => ({
  StatsigClient: jest.fn().mockImplementation(() => ({
    initializeAsync: jest.fn().mockResolvedValue(undefined),
    logEvent: jest.fn(),
  })),
}));
jest.mock('@statsig/web-analytics', () => ({runStatsigAutoCapture: jest.fn()}));
jest.mock('@cdo/apps/metrics/statsigHelpers', () => ({
  findOrCreateStableId: jest.fn().mockResolvedValue('initial-id'),
  getUserID: jest.fn(),
  getUserType: jest.fn(),
}));
jest.mock('@cdo/apps/util/experiments', () => ({
  getEnabledExperiments: () => [],
}));
jest.mock('@cdo/apps/util/globalEdition', () => ({
  getGlobalEditionRegion: () => 'US',
}));
jest.mock('@cdo/apps/logToCloud', () => ({}));

describe('StatsigReporter async initialization', () => {
  beforeAll(async () => {
    await statsigReporter.readyPromise;
  });

  it('waits for the stable ID before creating the client and sending queued events', async () => {
    let resolveId;
    findOrCreateStableId.mockReturnValue(
      new Promise(resolve => {
        resolveId = resolve;
      })
    );
    const reporter = new statsigReporter.constructor();
    reporter.sendEvent('test-event', {value: 1});
    await Promise.resolve();

    expect(reporter.ready).toBe(false);
    expect(StatsigClient).not.toHaveBeenCalled();
    resolveId('server-id');
    await reporter.readyPromise;

    expect(reporter.user.customIDs.stableID).toBe('server-id');
    expect(reporter.statsigClient.logEvent).toHaveBeenCalledWith(
      'test-event',
      'test-event',
      {value: 1}
    );
    expect(StatsigClient).toHaveBeenCalledTimes(1);
  });
});
