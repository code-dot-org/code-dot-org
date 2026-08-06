import {StatsigClient} from '@statsig/js-client';

import DCDO from '@cdo/apps/dcdo';
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

describe('StatsigReporter shouldPutRecord', () => {
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
    expect(statsigReporter.shouldPutRecord(false)).toBe(true);
  });

  it('transmits when statsig-enabled is absent', () => {
    expect(statsigReporter.shouldPutRecord(false)).toBe(true);
  });

  it('does not transmit when statsig-enabled is false', () => {
    DCDO.set('statsig-enabled', false);
    expect(statsigReporter.shouldPutRecord(false)).toBe(false);
  });

  it('does not transmit when statsig-enabled is false, even with alwaysPut', () => {
    DCDO.set('statsig-enabled', false);
    expect(statsigReporter.shouldPutRecord(true)).toBe(false);
  });
});
