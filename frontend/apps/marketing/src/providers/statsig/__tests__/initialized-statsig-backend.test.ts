import statsig from '@/providers/statsig/statsig';

import {generateBootstrapValues} from '../statsig-backend';

jest.mock('@/providers/statsig/statsig', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    getClientInitializeResponse: jest.fn(),
  },
}));

describe('generateBootstrapValues', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return client initialize response if statsig is initialized', async () => {
    await generateBootstrapValues();
    expect(statsig!.getClientInitializeResponse).toHaveBeenCalledTimes(1);
  });
});
