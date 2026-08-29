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
      loaded = channel;
    },
    getMetadata: () => ({
      channelId: loaded,
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
  return {music, calls};
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
    // Only the winner plays; the loser was stopped and never started.
    expect(calls.filter(c => c.startsWith('play')).length).toBe(2);
    expect(calls[calls.length - 1]).toBe('play 3');
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
