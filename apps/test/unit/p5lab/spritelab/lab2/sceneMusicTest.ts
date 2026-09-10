// The real ProjectPlayer drags Music Lab's whole player chain (and a web
// worker) into the suite; the wrapper is handed a fake below.
jest.mock('@cdo/apps/music/ProjectPlayer', () => ({
  __esModule: true,
  default: class {},
}));
import SceneMusic, {
  BackgroundPlayer,
} from '@cdo/apps/p5lab/spritelab/lab2/sceneMusic';

// A fake BackgroundPlayer: the wrapper only orchestrates load, the metadata
// check, looping playback and stop — the loop math itself is ProjectPlayer's
// (see ProjectPlayerTest).
function fakes() {
  const calls: string[] = [];
  let loaded: string | null = null;
  let failNext: Error | null = null;
  let metadataChannel: string | null = null;
  const player: BackgroundPlayer = {
    loadProject: async (channel: string) => {
      calls.push(`load ${channel}`);
      if (failNext) {
        const error = failNext;
        failNext = null;
        throw error;
      }
      loaded = channel;
    },
    getMetadata: () =>
      ({
        channelId: metadataChannel ?? loaded,
        playbackEvents: [{}, {}, {}],
        lastMeasure: 8,
      } as ReturnType<BackgroundPlayer['getMetadata']>),
    playLooping: () => calls.push('playLooping'),
    stop: () => calls.push('stop'),
  };
  const music = new SceneMusic(player);
  return {
    music,
    calls,
    failNextLoad: (error: Error) => (failNext = error),
    serveMetadataFor: (channel: string) => (metadataChannel = channel),
  };
}

describe('SpriteLab2 SceneMusic', () => {
  it('loads a song and plays it looping', async () => {
    const {music, calls} = fakes();
    expect(await music.play('song-a')).toBe(true);
    expect(calls).toEqual(['stop', 'load song-a', 'playLooping']);
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
    expect(calls[calls.length - 1]).toBe('playLooping');
  });

  it('refuses a failed song without another fetch until the next run', async () => {
    const {music, calls, failNextLoad} = fakes();
    failNextLoad(new Error('sources unavailable'));
    await expect(music.play('song-a')).rejects.toThrow('sources unavailable');
    expect(music.playing).toBeNull();
    // A repeating event re-asking for the broken song stays quiet...
    expect(await music.play('song-a')).toBe(false);
    expect(calls.filter(c => c === 'load song-a')).toHaveLength(1);
    // ...and the next run (stop() marks its end) tries again.
    music.stop();
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
    expect(calls).not.toContain('playLooping');
  });

  it('stops and forgets the song', async () => {
    const {music, calls} = fakes();
    await music.play('song-a');
    music.stop();
    expect(calls[calls.length - 1]).toBe('stop');
    expect(music.playing).toBeNull();
  });
});
