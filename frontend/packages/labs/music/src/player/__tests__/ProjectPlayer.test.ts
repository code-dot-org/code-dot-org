import {ApiError, DashboardApiClient} from '@code-dot-org/core/api';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {defaultMetadata} from '../DefaultMusic';
import MusicLibrary from '../MusicLibrary';
import {computeEventMeasures} from '../MusicMetadata';
import MusicPlayer from '../MusicPlayer';
import ProjectPlayer, {createProjectPlayer} from '../ProjectPlayer';
import {isOnDefaultPack} from '../../utils/pack';

import {libraryJson, projectSource} from './musicProject';

vi.mock('@code-dot-org/core/api', async importOriginal => ({
  ...(await importOriginal<typeof import('@code-dot-org/core/api')>()),
  DashboardApiClient: {
    transport: {request: vi.fn(), requestWithMeta: vi.fn()},
    sources: {get: vi.fn()},
  },
}));

// The shared tone stub cannot build the effect busses; no test here makes sound.
vi.mock('../ToneJSPlayer', () => ({
  default: class {
    setBpm = vi.fn();
    loadSounds = vi.fn();
  },
}));

const sourcesGet = vi.mocked(DashboardApiClient.sources.get);
const transportRequest = vi.mocked(DashboardApiClient.transport.request);

const savedSources = (labConfig: Record<string, Record<string, string>>) => ({
  sources: {source: JSON.stringify(projectSource), labConfig},
  versionId: 'v1',
});

const notFound = () =>
  new ApiError('Not Found', {status: 404, url: '/v3/sources', method: 'GET'});

beforeEach(() => {
  (MusicLibrary as unknown as {instance?: MusicLibrary}).instance = undefined;
  transportRequest.mockResolvedValue(libraryJson);
  vi.spyOn(MusicPlayer.prototype, 'preloadSounds').mockResolvedValue();
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('ProjectPlayer', () => {
  it('compiles a saved project into metadata', async () => {
    sourcesGet.mockResolvedValue(
      savedSources({
        music: {library: 'test-library', packId: 'pack1', blockMode: 'Simple2'},
      }),
    );
    const player = createProjectPlayer();

    await player.loadProject('channel-1');

    expect(sourcesGet).toHaveBeenCalledWith({channelId: 'channel-1'});
    const metadata = player.getMetadata();
    expect(metadata).toMatchObject({
      channelId: 'channel-1',
      lastMeasure: 5,
      packId: 'pack1',
      libraryName: 'test-library',
    });
    expect(
      metadata.playbackEvents.map(e => [e.blockId, e.when]).sort(),
    ).toEqual([
      ['s1', 1],
      ['s2', 3],
      ['s3', 2],
    ]);
    expect(metadata.orderedFunctions.map(f => f.name)).toContain('chorus');
    expect(player.getLastMeasure()).toBe(5);
    expect(player.getEventMeasures()).toEqual([]);
    expect(MusicPlayer.prototype.preloadSounds).toHaveBeenCalledWith(
      metadata.playbackEvents,
    );
  });

  it("prepares the library with the project's library and pack", async () => {
    sourcesGet.mockResolvedValue(
      savedSources({music: {library: 'test-library', packId: 'pack1'}}),
    );
    const setPack = vi.spyOn(MusicLibrary.prototype, 'setCurrentPackId');
    const player = createProjectPlayer();

    await player.loadProject('channel-1');

    expect(transportRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('music-library-test-library.json'),
      }),
    );
    expect(setPack).toHaveBeenCalledWith('pack1');
    // A pack's own tempo overrides the library's.
    expect(player.getBpm()).toBe(libraryJson.packs[0].bpm);
  });

  it('falls back to launch2024 when the project names no library', async () => {
    sourcesGet.mockResolvedValue(savedSources({music: {}}));
    const player = createProjectPlayer();

    await player.loadProject('channel-1');

    expect(transportRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('music-library-launch2024.json'),
      }),
    );
  });

  it('plays the default song for a channel with no sources', async () => {
    sourcesGet.mockRejectedValue(notFound());
    const setPack = vi.spyOn(MusicLibrary.prototype, 'setCurrentPackId');
    const player = createProjectPlayer();

    await player.loadProject('channel-1');

    expect(player.getMetadata()).toBe(defaultMetadata);
    expect(setPack).toHaveBeenCalledWith(defaultMetadata.packId);
  });

  it('rethrows any other failure', async () => {
    const error = new ApiError('Server Error', {
      status: 500,
      url: '/v3/sources',
      method: 'GET',
    });
    sourcesGet.mockRejectedValue(error);

    await expect(createProjectPlayer().loadProject('channel-1')).rejects.toBe(
      error,
    );
  });

  it('serves the default channel without a request', async () => {
    const player = createProjectPlayer();

    await player.loadProject(defaultMetadata.channelId);

    expect(sourcesGet).not.toHaveBeenCalled();
    expect(player.getMetadata()).toBe(defaultMetadata);
  });

  it('refuses to play or report before a project loads', () => {
    const player = new ProjectPlayer();
    expect(() => player.getMetadata()).toThrow('No project loaded!');
    expect(() => player.getEventMeasures()).toThrow('No project loaded!');
    expect(() => player.getBpm()).toThrow('No project loaded!');
    expect(() => player.play()).toThrow('No project loaded!');
    expect(player.getLastMeasure()).toBeUndefined();
  });

  it('stops itself after the last measure and calls onEnded', async () => {
    vi.useFakeTimers();
    try {
      const musicPlayer = {
        preloadSounds: vi.fn().mockResolvedValue(undefined),
        updateConfiguration: vi.fn(),
        playSong: vi.fn(),
        stopSong: vi.fn(),
        getBPM: () => 120,
        getCurrentPlayheadPosition: vi.fn().mockReturnValue(1),
      };
      const player = new ProjectPlayer(musicPlayer as unknown as MusicPlayer);
      await player.loadProject(defaultMetadata.channelId);
      const onEnded = vi.fn();

      player.play(onEnded);
      expect(musicPlayer.playSong).toHaveBeenCalledWith(
        defaultMetadata.playbackEvents,
      );
      vi.advanceTimersByTime(500);
      expect(onEnded).not.toHaveBeenCalled();

      musicPlayer.getCurrentPlayheadPosition.mockReturnValue(
        defaultMetadata.lastMeasure + 1,
      );
      vi.advanceTimersByTime(500);
      expect(onEnded).toHaveBeenCalledOnce();
      expect(musicPlayer.stopSong).toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('computeEventMeasures', () => {
  it('keeps the measures where more than two sounds start', () => {
    const at = (when: number) =>
      ({...defaultMetadata.playbackEvents[0], when}) as const;
    expect(
      computeEventMeasures([at(1), at(1), at(1), at(1.5), at(2), at(2), at(2)]),
    ).toEqual([1, 2]);
    expect(computeEventMeasures(defaultMetadata.playbackEvents)).toEqual([]);
  });
});

describe('isOnDefaultPack', () => {
  it('is true only for a project that chose the default pack', () => {
    expect(isOnDefaultPack({music: {packId: 'default'}})).toBe(true);
    expect(isOnDefaultPack({music: {packId: 'pack1'}})).toBe(false);
    expect(isOnDefaultPack({music: {}})).toBe(false);
    expect(isOnDefaultPack(undefined)).toBe(false);
  });
});
