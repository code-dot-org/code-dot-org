import {
  clearFlaggedFilename,
  getFlaggedFilename,
  setFlaggedFilename,
  unblockIfFlaggedAssetDeleted,
} from '@cdo/apps/code-studio/assets/flaggedAssetMetadata';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';

jest.mock('@cdo/apps/util/HttpClient', () => {
  const actual = jest.requireActual('@cdo/apps/util/HttpClient');
  return {
    __esModule: true,
    ...actual,
    default: {
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      post: jest.fn(),
    },
  };
});

jest.mock('@cdo/apps/metrics/MetricsReporter', () => ({
  __esModule: true,
  default: {logError: jest.fn()},
}));

describe('flaggedAssetMetadata', () => {
  let fetchAbuseScore;

  beforeEach(() => {
    jest.clearAllMocks();
    fetchAbuseScore = jest.fn().mockResolvedValue(undefined);
    global.dashboard = {project: {fetchAbuseScore}};
  });

  afterEach(() => {
    delete global.dashboard;
  });

  describe('getFlaggedFilename', () => {
    it('returns filename from metadata', async () => {
      HttpClient.get.mockResolvedValue({
        json: () => Promise.resolve({filename: 'bad.png'}),
      });
      await expect(getFlaggedFilename('channel-1')).resolves.toBe('bad.png');
    });

    it('returns null on 404', async () => {
      const error = new NetworkError('missing', {status: 404});
      HttpClient.get.mockRejectedValue(error);
      await expect(getFlaggedFilename('channel-1')).resolves.toBeNull();
    });
  });

  describe('setFlaggedFilename / clearFlaggedFilename', () => {
    it('PUTs filename JSON', async () => {
      HttpClient.put.mockResolvedValue({});
      await setFlaggedFilename('channel-1', 'bad.png');
      expect(HttpClient.put).toHaveBeenCalledWith(
        '/v3/assets/channel-1/metadata/image_moderation_flagged',
        JSON.stringify({filename: 'bad.png'}),
        true,
        {'Content-Type': 'application/json; charset=UTF-8'}
      );
    });

    it('DELETE clears metadata', async () => {
      HttpClient.delete.mockResolvedValue({});
      await clearFlaggedFilename('channel-1');
      expect(HttpClient.delete).toHaveBeenCalledWith(
        '/v3/assets/channel-1/metadata/image_moderation_flagged',
        true
      );
    });
  });

  describe('unblockIfFlaggedAssetDeleted', () => {
    it('no-ops when deleted name is not the flagged file', async () => {
      HttpClient.get.mockResolvedValue({
        json: () => Promise.resolve({filename: 'flagged.png'}),
      });
      const result = await unblockIfFlaggedAssetDeleted(
        'channel-1',
        'other.png'
      );
      expect(result).toEqual({didUnblock: false, abuseScore: null});
      expect(HttpClient.post).not.toHaveBeenCalled();
      expect(HttpClient.delete).not.toHaveBeenCalled();
    });

    it('unflags then clears metadata when names match', async () => {
      HttpClient.get.mockResolvedValue({
        json: () => Promise.resolve({filename: 'bad.png'}),
      });
      HttpClient.post.mockResolvedValue({
        json: () => Promise.resolve({abuse_score: 0}),
      });
      HttpClient.delete.mockResolvedValue({});

      const result = await unblockIfFlaggedAssetDeleted('channel-1', 'bad.png');

      expect(HttpClient.post).toHaveBeenCalledWith(
        '/v3/channels/channel-1/abuse/image',
        JSON.stringify({type: 'unflag'}),
        true,
        {'Content-Type': 'application/json; charset=UTF-8'}
      );
      expect(HttpClient.delete).toHaveBeenCalled();
      expect(fetchAbuseScore).toHaveBeenCalled();
      expect(result).toEqual({didUnblock: true, abuseScore: 0});
    });

    it('keeps metadata when unflag fails', async () => {
      HttpClient.get.mockResolvedValue({
        json: () => Promise.resolve({filename: 'bad.png'}),
      });
      HttpClient.post.mockRejectedValue(new Error('network'));

      const result = await unblockIfFlaggedAssetDeleted('channel-1', 'bad.png');

      expect(HttpClient.delete).not.toHaveBeenCalled();
      expect(result).toEqual({didUnblock: false, abuseScore: null});
    });
  });
});
