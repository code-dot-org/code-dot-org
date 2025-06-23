import {generateBootstrapValues} from '../statsig-backend';

jest.mock('@/providers/statsig/statsig', () => ({
  __esModule: true,
  getStatsig: undefined,
}));

describe('generateBootstrapValues', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  describe('undefined statsig client', () => {
    it('should return empty string if statsig is not initialized', async () => {
      const result = await generateBootstrapValues();
      expect(result).toBe('');
    });
  });
});
