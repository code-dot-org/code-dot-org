import {getStage} from '@/config/stage';

import initializeNewRelic from '../agent';

jest.mock('@/config/stage', () => ({
  getStage: jest.fn(),
}));

jest.mock('@/config/newrelic', () => ({
  getNewRelicConfig: jest.fn(),
}));

jest.mock('@newrelic/browser-agent/loaders/browser-agent', () => ({
  BrowserAgent: jest.fn().mockImplementation(() => ({
    init: jest.fn(),
  })),
}));

describe('initializeNewRelic', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined if window is undefined', async () => {
    const originalWindow = global.window;
    // Simulate server-side environment
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (global as any).window;

    const result = await initializeNewRelic;
    expect(result).toBeUndefined();

    // Restore window
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = originalWindow;
  });

  it('should not load New Relic in non-production/test environments', async () => {
    (getStage as jest.Mock).mockReturnValue('development');

    const result = await initializeNewRelic;
    expect(result).toBeUndefined();
  });
});
