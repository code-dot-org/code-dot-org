import HttpClient from '@cdo/apps/util/HttpClient';
import {CategoryAnalysis, moderateImageUrl} from '@cdo/apps/util/moderateImage';

jest.mock('@code-dot-org/core/plugins/observability', () => ({
  startSpan: (_options: unknown, callback: () => unknown) => callback(),
}));

jest.mock('@cdo/apps/metrics/AnalyticsReporter', () => ({
  __esModule: true,
  default: {sendEvent: jest.fn()},
}));

jest.mock('@cdo/apps/metrics/MetricsReporter', () => ({
  __esModule: true,
  default: {incrementCounter: jest.fn(), logError: jest.fn()},
}));

jest.mock('@cdo/apps/util/HttpClient', () => ({
  __esModule: true,
  default: {post: jest.fn()},
}));

const mockPost = HttpClient.post as jest.Mock;

const respondWith = (categoriesAnalysis: CategoryAnalysis[]) =>
  mockPost.mockResolvedValue({json: async () => ({categoriesAnalysis})});

describe('moderateImageUrl severity thresholds', () => {
  const imageUrl = 'https://example.com/image.png';

  afterEach(() => {
    mockPost.mockReset();
  });

  it('allows low sexual severity in applab', async () => {
    respondWith([{category: 'Sexual', severity: 2}]);
    await expect(moderateImageUrl(imageUrl, 'applab', {})).resolves.toBe(
      'safe'
    );
  });

  it('flags low sexual severity in other labs', async () => {
    respondWith([{category: 'Sexual', severity: 2}]);
    await expect(moderateImageUrl(imageUrl, 'gamelab', {})).resolves.toBe(
      'flagged'
    );
  });

  it('flags medium sexual severity in applab', async () => {
    respondWith([{category: 'Sexual', severity: 4}]);
    await expect(moderateImageUrl(imageUrl, 'applab', {})).resolves.toBe(
      'flagged'
    );
  });
});
