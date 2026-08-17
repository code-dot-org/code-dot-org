import {
  clearImageUrlModerationCache,
  ERROR_CACHE_DURATION_MS,
  isAbsoluteImageUrl,
  moderateApplabImageUrl,
} from '@cdo/apps/applab/imageUrlModeration';
import {ABSOLUTE_REGEXP} from '@cdo/apps/assetManagement/assetPrefix';
import {moderateImageUrl} from '@cdo/apps/util/moderateImage';

jest.mock('@cdo/apps/util/moderateImage', () => ({
  moderateImageUrl: jest.fn(),
}));

describe('imageUrlModeration', () => {
  const mockModerateImageUrl = moderateImageUrl as jest.MockedFunction<
    typeof moderateImageUrl
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    clearImageUrlModerationCache();
    mockModerateImageUrl.mockResolvedValue('safe');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('isAbsoluteImageUrl', () => {
    it('matches ABSOLUTE_REGEXP', () => {
      expect(isAbsoluteImageUrl('https://example.com/a.png')).toBe(
        ABSOLUTE_REGEXP.test('https://example.com/a.png')
      );
      expect(isAbsoluteImageUrl('relative.png')).toBe(false);
    });
  });

  describe('moderateApplabImageUrl', () => {
    it('returns invalid-url without calling Azure for relative paths', async () => {
      const result = await moderateApplabImageUrl('cat.png');
      expect(result).toEqual({status: 'invalid-url'});
      expect(mockModerateImageUrl).not.toHaveBeenCalled();
    });

    it('treats images.code.org URLs as safe without calling Azure', async () => {
      const result = await moderateApplabImageUrl(
        'http://images.code.org/curriculum.png'
      );
      expect(result).toEqual({
        status: 'safe',
        normalizedUrl: 'https://images.code.org/curriculum.png',
      });
      expect(mockModerateImageUrl).not.toHaveBeenCalled();
    });

    it('does not skip lookalike hosts of images.code.org', async () => {
      const url = 'https://images.code.org.evil.com/curriculum.png';
      const result = await moderateApplabImageUrl(url);
      expect(result).toEqual({status: 'safe', normalizedUrl: url});
      expect(mockModerateImageUrl).toHaveBeenCalledTimes(1);
    });

    it('normalizes http to https and moderates once', async () => {
      const result = await moderateApplabImageUrl(
        'http://example.com/image.png'
      );
      expect(result).toEqual({
        status: 'safe',
        normalizedUrl: 'https://example.com/image.png',
      });
      expect(mockModerateImageUrl).toHaveBeenCalledTimes(1);
      expect(mockModerateImageUrl).toHaveBeenCalledWith(
        'https://example.com/image.png',
        'applab',
        {
          uploaderType: 'ImageURLInput',
          assetUrl: 'https://example.com/image.png',
        }
      );
    });

    it('reuses a cached safe/flagged result on later calls', async () => {
      mockModerateImageUrl.mockResolvedValue('flagged');
      const url = 'https://example.com/cached.png';

      await expect(moderateApplabImageUrl(url)).resolves.toEqual({
        status: 'flagged',
        normalizedUrl: url,
      });
      await expect(moderateApplabImageUrl(url)).resolves.toEqual({
        status: 'flagged',
        normalizedUrl: url,
      });

      expect(mockModerateImageUrl).toHaveBeenCalledTimes(1);
    });

    it('coalesces concurrent requests for the same URL', async () => {
      let resolveModeration!: (status: 'safe' | 'flagged' | 'error') => void;
      mockModerateImageUrl.mockImplementation(
        () =>
          new Promise(resolve => {
            resolveModeration = resolve;
          })
      );

      const url = 'https://example.com/inflight.png';
      const first = moderateApplabImageUrl(url);
      const second = moderateApplabImageUrl(url);

      expect(mockModerateImageUrl).toHaveBeenCalledTimes(1);
      resolveModeration('safe');

      await expect(first).resolves.toEqual({
        status: 'safe',
        normalizedUrl: url,
      });
      await expect(second).resolves.toEqual({
        status: 'safe',
        normalizedUrl: url,
      });
      expect(mockModerateImageUrl).toHaveBeenCalledTimes(1);
    });

    it('caches errors briefly, then allows retry after the cache duration', async () => {
      jest.useFakeTimers();
      mockModerateImageUrl.mockResolvedValue('error');
      const url = 'https://example.com/transient.png';

      await expect(moderateApplabImageUrl(url)).resolves.toEqual({
        status: 'error',
        normalizedUrl: url,
      });
      await expect(moderateApplabImageUrl(url)).resolves.toEqual({
        status: 'error',
        normalizedUrl: url,
      });
      expect(mockModerateImageUrl).toHaveBeenCalledTimes(1);

      mockModerateImageUrl.mockResolvedValue('safe');
      jest.advanceTimersByTime(ERROR_CACHE_DURATION_MS + 1);

      await expect(moderateApplabImageUrl(url)).resolves.toEqual({
        status: 'safe',
        normalizedUrl: url,
      });
      expect(mockModerateImageUrl).toHaveBeenCalledTimes(2);
    });
  });
});
