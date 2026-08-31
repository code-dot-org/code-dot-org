// The real players drag Music Lab's whole player chain (and a web worker)
// into the suite; the wrapper is handed fakes below.
jest.mock('@cdo/apps/music/player/MusicPlayer', () => ({
  __esModule: true,
  default: class {},
}));
jest.mock('@cdo/apps/music/ProjectPlayer', () => ({
  __esModule: true,
  default: class {},
}));
import SceneMusic from '@cdo/apps/p5lab/spritelab/lab2/sceneMusic';

// Fakes standing in for MusicPlayer and ProjectPlayer: the wrapper only
// needs load, metadata, play, stop and the loop settings.
function fakes(lastMeasure = 8) {
  const calls: string[] = [];
  let loaded: string | null = null;
  let failNext: Error | null = null;
  let metadataChannel: string | null = null;
  const musicPlayer = {
    setLoopStart: (m: number) => calls.push(`loopStart ${m}`),
    setLoopEnd: (m: number) => calls.push(`loopEnd ${m}`),
    setLoopEnabled: (on: boolean) => calls.push(`loop ${on}`),
    playSong: (events: unknown[]) => calls.push(`play ${events.length}`),
    stopSong: () => calls.push('stop'),
  };
  const projectPlayer = {
    loadProject: async (channel: string) => {
      calls.push(`load ${channel}`);
      if (failNext) {
        const error = failNext;
        failNext = null;
        throw error;
      }
      loaded = channel;
    },
    getMetadata: () => ({
      channelId: metadataChannel ?? loaded,
      playbackEvents: [{}, {}, {}],
      lastMeasure,
    }),
  };
  const music = new SceneMusic(
    () =>
      ({musicPlayer, projectPlayer} as unknown as ReturnType<
        NonNullable<ConstructorParameters<typeof SceneMusic>[0]>
      >)
  );
  return {
    music,
    calls,
    failNextLoad: (error: Error) => (failNext = error),
    serveMetadataFor: (channel: string) => (metadataChannel = channel),
  };
}

describe('SpriteLab2 SceneMusic', () => {
  it('loads a song and plays it repeating from its first to its last measure', async () => {
    const {music, calls} = fakes(8);
    expect(await music.play('song-a')).toBe(true);
    expect(calls).toEqual([
      'load song-a',
      'loopStart 1',
      'loopEnd 9',
      'loop true',
      'play 3',
    ]);
    expect(music.playing).toBe('song-a');
  });

  it('leaves the song alone when asked for the one already playing', async () => {
    const {music, calls} = fakes();
    await music.play('song-a');
    const before = calls.length;
    expect(await music.play('song-a')).toBe(true);
    expect(calls.length).toBe(before);
  });

  it('changes song, and lets a later request win a race', async () => {
    const {music, calls} = fakes();
    await music.play('song-a');
    const first = music.play('song-b');
    const second = music.play('song-c');
    expect(await first).toBe(false);
    expect(await second).toBe(true);
    expect(music.playing).toBe('song-c');
    // Loads run one at a time; the superseded request never loads at all.
    expect(calls.filter(c => c.startsWith('load'))).toEqual([
      'load song-a',
      'load song-c',
    ]);
    expect(calls[calls.length - 1]).toBe('play 3');
  });

  it('forgets a song whose load failed, so it can be tried again', async () => {
    const {music, calls, failNextLoad} = fakes();
    failNextLoad(new Error('sources unavailable'));
    await expect(music.play('song-a')).rejects.toThrow('sources unavailable');
    expect(music.playing).toBeNull();
    expect(await music.play('song-a')).toBe(true);
    expect(calls.filter(c => c === 'load song-a')).toHaveLength(2);
  });

  it('plays nothing for a project that would not load', async () => {
    // Music Lab's loader falls back to its built-in metadata; the mismatched
    // channel id is how that shows.
    const {music, calls, serveMetadataFor} = fakes();
    serveMetadataFor('default-music');
    expect(await music.play('song-a')).toBe(false);
    expect(music.playing).toBeNull();
    expect(calls.some(c => c.startsWith('play'))).toBe(false);
  });

  it('stops and forgets the song', async () => {
    const {music, calls} = fakes();
    await music.play('song-a');
    music.stop();
    expect(calls.slice(-2)).toEqual(['stop', 'loop false']);
    expect(music.playing).toBeNull();
  });

  it('creates no player until a song is asked for', () => {
    let created = 0;
    const music = new SceneMusic(() => {
      created++;
      throw new Error('not expected');
    });
    music.stop();
    expect(created).toBe(0);
  });
});
