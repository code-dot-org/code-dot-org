import {StatsigClient} from '@statsig/js-client';
import {runStatsigSessionReplay} from '@statsig/session-replay';

import {findOrCreateStableId} from '@cdo/apps/metrics/statsigHelpers';
import StatsigSessionReplay from '@cdo/apps/metrics/StatsigSessionReplay';

jest.mock('@statsig/js-client', () => ({
  StatsigClient: jest.fn().mockImplementation(() => ({
    initializeAsync: jest.fn().mockResolvedValue(undefined),
    shutdown: jest.fn(),
  })),
}));
jest.mock('@statsig/session-replay', () => ({
  runStatsigSessionReplay: jest.fn(),
}));
jest.mock('@statsig/web-analytics', () => ({runStatsigAutoCapture: jest.fn()}));
jest.mock('@cdo/apps/metrics/statsigHelpers', () => ({
  findOrCreateStableId: jest.fn(),
  getUserID: jest.fn(),
  getUserType: jest.fn(),
}));
jest.mock('@cdo/apps/utils', () => ({isProductionEnvironment: () => true}));

describe('StatsigSessionReplay async initialization', () => {
  let resolveId;
  let replay;

  beforeEach(() => {
    findOrCreateStableId.mockReturnValue(
      new Promise(resolve => {
        resolveId = resolve;
      })
    );
    replay = new StatsigSessionReplay();
  });

  it('waits for the ID and starts only once for concurrent requests', async () => {
    const first = replay.startRecording();
    const second = replay.startRecording();
    expect(StatsigClient).not.toHaveBeenCalled();
    resolveId('server-id');
    await Promise.all([first, second]);
    expect(StatsigClient).toHaveBeenCalledTimes(1);
    expect(StatsigClient).toHaveBeenCalledWith('', {
      customIDs: {stableID: 'server-id'},
      custom: {},
    });
    expect(runStatsigSessionReplay).toHaveBeenCalledTimes(1);
  });

  it('does not start if stopped while waiting for the ID', async () => {
    const pending = replay.startRecording();
    replay.stopRecording();
    resolveId('server-id');
    await pending;
    expect(StatsigClient).not.toHaveBeenCalled();

    await replay.startRecording();
    expect(StatsigClient).toHaveBeenCalledTimes(1);
    const client = replay.statsigClient;
    replay.stopRecording();
    expect(client.shutdown).toHaveBeenCalledTimes(1);
    expect(replay.statsigClient).toBeNull();
  });
});
