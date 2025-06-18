import LabMetricsReporter from '@cdo/apps/lab2/Lab2MetricsReporter';
import SoundCache from '@cdo/apps/music/player/SoundCache';
import HttpClient, {NetworkError} from '@cdo/apps/util/HttpClient';
import {fetchSignedCookies} from '@cdo/apps/utils';
import '@testing-library/jest-dom';

jest.mock('@cdo/apps/utils');

const UNRESTRICTED_SOUND = 'sound.mp3';
const RESTRICTED_SOUND = '/restricted/musiclab/restricted.mp3';

describe('SoundCache', () => {
  let audioBuffer: AudioBuffer;
  let arrayBuffer: ArrayBuffer;
  let validResponse: Response;
  let soundCache: SoundCache;
  let audioContext: jest.Mocked<AudioContext>;
  let metricsReporter: jest.Mocked<LabMetricsReporter>;
  let httpClient: jest.Mocked<typeof HttpClient>;
  let fetchSignedCookiesMock: jest.MockedFunction<typeof fetchSignedCookies>;

  beforeEach(() => {
    audioBuffer = {} as AudioBuffer;
    arrayBuffer = new ArrayBuffer(0);
    validResponse = new Response(arrayBuffer);

    audioContext = {
      decodeAudioData: jest.fn(),
    } as unknown as jest.Mocked<AudioContext>;

    metricsReporter = {
      logError: jest.fn(),
      publishMetric: jest.fn(),
      reportLoadTime: jest.fn(),
    } as unknown as jest.Mocked<LabMetricsReporter>;

    httpClient = {
      get: jest.fn(),
    } as unknown as jest.Mocked<typeof HttpClient>;

    fetchSignedCookiesMock = jest.mocked(fetchSignedCookies);
    fetchSignedCookiesMock.mockResolvedValue(new Response(null, {status: 200}));

    httpClient.get.mockResolvedValue(validResponse);
    audioContext.decodeAudioData.mockResolvedValue(audioBuffer);

    soundCache = new SoundCache(audioContext, metricsReporter, httpClient);
  });

  describe('loadSound', () => {
    it('loads non-restricted sound from URL', async () => {
      expect(await soundCache.loadSound(UNRESTRICTED_SOUND)).toBe(audioBuffer);

      expect(fetchSignedCookiesMock).not.toHaveBeenCalled();
      expect(httpClient.get).toHaveBeenCalledWith(UNRESTRICTED_SOUND);
      expect(audioContext.decodeAudioData).toHaveBeenCalledWith(arrayBuffer);
      expect(metricsReporter.reportLoadTime).toHaveBeenCalledWith(
        'SoundCache.SingleSoundLoadTime',
        expect.any(Number)
      );
    });

    it('returns sound from cache if already loaded', async () => {
      // Load sound into cache
      expect(await soundCache.loadSound(UNRESTRICTED_SOUND)).toBe(audioBuffer);
      expect(httpClient.get).toHaveBeenCalled();

      // Clear mocks
      httpClient.get.mockClear();
      // Load again
      expect(await soundCache.loadSound(UNRESTRICTED_SOUND)).toBe(audioBuffer);
      expect(httpClient.get).not.toHaveBeenCalled();
    });

    it('fetches signed cookies for restricted sound', async () => {
      expect(await soundCache.loadSound(RESTRICTED_SOUND)).toBe(audioBuffer);

      expect(fetchSignedCookiesMock).toHaveBeenCalled();
      expect(httpClient.get).toHaveBeenCalledWith(RESTRICTED_SOUND);
      expect(audioContext.decodeAudioData).toHaveBeenCalledWith(arrayBuffer);
    });

    it('does not fetch signed cookies if already loaded', async () => {
      // Load restricted sound
      expect(await soundCache.loadSound(RESTRICTED_SOUND)).toBe(audioBuffer);
      expect(fetchSignedCookiesMock).toHaveBeenCalled();

      // Clear mocks
      fetchSignedCookiesMock.mockClear();
      // Load again
      expect(await soundCache.loadSound(RESTRICTED_SOUND)).toBe(audioBuffer);
      expect(fetchSignedCookiesMock).not.toHaveBeenCalled();
    });

    it('retries fetching restricted sound if cookies expire', async () => {
      httpClient.get
        .mockRejectedValueOnce(
          new NetworkError('Forbidden', new Response(null, {status: 403}))
        )
        .mockResolvedValueOnce(validResponse);

      expect(await soundCache.loadSound(RESTRICTED_SOUND)).toBe(audioBuffer);

      expect(fetchSignedCookiesMock).toHaveBeenCalledTimes(2);
      expect(httpClient.get).toHaveBeenCalledTimes(2);
      expect(audioContext.decodeAudioData).toHaveBeenCalledTimes(1);
    });

    it('throws an error if fetching signed cookies fails', async () => {
      fetchSignedCookiesMock.mockResolvedValue(
        new Response(null, {status: 500})
      );

      await expect(soundCache.loadSound(RESTRICTED_SOUND)).rejects.toThrow(
        'Failed to refresh signed cookies: 500'
      );

      expect(fetchSignedCookiesMock).toHaveBeenCalled();
      expect(httpClient.get).not.toHaveBeenCalled();
      expect(audioContext.decodeAudioData).not.toHaveBeenCalled();
    });

    it('throw an error if fetching signed cookies throws an error', async () => {
      fetchSignedCookiesMock.mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      await expect(soundCache.loadSound(RESTRICTED_SOUND)).rejects.toThrow(
        'Failed to fetch'
      );

      expect(fetchSignedCookiesMock).toHaveBeenCalled();
      expect(httpClient.get).not.toHaveBeenCalled();
      expect(audioContext.decodeAudioData).not.toHaveBeenCalled();
    });

    it('throws an error if fetching sound fails with a non-403 error', async () => {
      httpClient.get.mockRejectedValue(
        new NetworkError('Internal Error', new Response(null, {status: 500}))
      );

      await expect(soundCache.loadSound(UNRESTRICTED_SOUND)).rejects.toThrow(
        'Internal Error'
      );

      expect(httpClient.get).toHaveBeenCalled();
      expect(audioContext.decodeAudioData).not.toHaveBeenCalled();
    });

    it('throws an error if decoding audio data fails', async () => {
      audioContext.decodeAudioData.mockRejectedValue(
        new DOMException('Decoding Error')
      );

      await expect(soundCache.loadSound(UNRESTRICTED_SOUND)).rejects.toThrow(
        'Decoding Error'
      );

      expect(httpClient.get).toHaveBeenCalled();
      expect(audioContext.decodeAudioData).toHaveBeenCalled();
    });
  });
});
