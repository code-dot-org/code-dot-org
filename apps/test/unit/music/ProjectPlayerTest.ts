// The constructor's collaborators drag Music Lab's Blockly setup and player
// chain into the suite; everything is handed fakes below.
jest.mock('@cdo/apps/music/blockly/setup', () => ({
  setUpBlocklyForMusicLab: jest.fn(),
}));
jest.mock('@cdo/apps/music/blockly/MusicBlocklyWorkspace', () => ({
  __esModule: true,
  default: class {
    initHeadless() {}
  },
}));
import {SourcesStore} from '@cdo/apps/lab2/projects/SourcesStore';
import MusicBlocklyWorkspace from '@cdo/apps/music/blockly/MusicBlocklyWorkspace';
import MusicPlayer from '@cdo/apps/music/player/MusicPlayer';
import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';

function fakePlayer() {
  const calls: string[] = [];
  const player = {
    setLoopStart: (m: number) => calls.push(`loopStart ${m}`),
    setLoopEnd: (m: number) => calls.push(`loopEnd ${m}`),
    setLoopEnabled: (on: boolean) => calls.push(`loop ${on}`),
    playSong: (events: unknown[]) => calls.push(`play ${events.length}`),
    stopSong: () => calls.push('stop'),
  } as unknown as MusicPlayer;
  return {player, calls};
}

function playerWithSong(lastMeasure = 8) {
  const {player, calls} = fakePlayer();
  const projectPlayer = new ProjectPlayer(
    player,
    {} as SourcesStore,
    new MusicBlocklyWorkspace()
  );
  // loadProject fetches; the loop math only needs the loaded metadata.
  Object.assign(projectPlayer, {
    currentMetadata: {
      channelId: 'song-a',
      playbackEvents: [{}, {}, {}],
      lastMeasure,
    },
  });
  return {projectPlayer, calls};
}

describe('ProjectPlayer.playLooping', () => {
  it('repeats the song from its first measure to past its last', () => {
    const {projectPlayer, calls} = playerWithSong(8);
    projectPlayer.playLooping();
    expect(calls).toEqual(['loopStart 1', 'loopEnd 9', 'loop true', 'play 3']);
  });

  it('stop ends the loop', () => {
    const {projectPlayer, calls} = playerWithSong();
    projectPlayer.playLooping();
    projectPlayer.stop();
    expect(calls.slice(-2)).toEqual(['stop', 'loop false']);
  });

  it('throws without a loaded project', () => {
    const {player} = fakePlayer();
    const projectPlayer = new ProjectPlayer(
      player,
      {} as SourcesStore,
      new MusicBlocklyWorkspace()
    );
    expect(() => projectPlayer.playLooping()).toThrow('No project loaded!');
  });
});
