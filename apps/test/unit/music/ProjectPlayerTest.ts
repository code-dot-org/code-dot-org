import {SourcesStore} from '@cdo/apps/lab2/projects/SourcesStore';
import MusicBlocklyWorkspace from '@cdo/apps/music/blockly/MusicBlocklyWorkspace';
import MusicLibrary, {LibraryJson} from '@cdo/apps/music/player/MusicLibrary';
import MusicPlayer from '@cdo/apps/music/player/MusicPlayer';
import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';

jest.mock('@cdo/apps/music/blockly/MusicBlocklyWorkspace', () => jest.fn());
jest.mock('@cdo/apps/music/blockly/setup', () => ({
  setUpBlocklyForMusicLab: jest.fn(),
}));
jest.mock('@cdo/apps/music/player/MusicPlayer', () => jest.fn());

const pack = (id: string, restricted: boolean) => ({
  id,
  name: id,
  path: id,
  imageSrc: '',
  restricted,
  sounds: [{name: 'verse', src: 'verse', length: 1, type: 'beat'}],
});

describe('ProjectPlayer', () => {
  it('loads a project saved without its pack under the pack of its sounds', async () => {
    const library = new MusicLibrary('test', {
      id: 'test',
      name: 'test',
      imageSrc: '',
      path: 'test',
      packs: [pack('song', true), pack('drums', false)],
      instruments: [],
      kits: [],
    } as unknown as LibraryJson);
    jest.spyOn(MusicLibrary, 'getInstance').mockReturnValue(library);
    const setCurrentPackId = jest.spyOn(library, 'setCurrentPackId');

    const loadCode = jest.fn();
    const workspace = {
      initHeadless: jest.fn(),
      loadCode,
      compileSong: jest.fn(),
      executeCompiledSong: () => ({
        playbackEvents: [],
        orderedFunctions: [],
        lastMeasure: 1,
      }),
    } as unknown as MusicBlocklyWorkspace;
    const player = {
      preloadSounds: jest.fn(),
      updateConfiguration: jest.fn(),
    } as unknown as MusicPlayer;
    const sourcesStore = {
      load: async () => ({
        source: JSON.stringify({
          blocks: {
            blocks: [{type: 'play_sound', fields: {sound: 'song/verse'}}],
          },
        }),
        labConfig: {music: {library: 'test', blockMode: 'Simple2'}},
      }),
    } as unknown as SourcesStore;

    const projectPlayer = new ProjectPlayer(player, sourcesStore, workspace);
    await projectPlayer.loadProject('channel1');

    expect(setCurrentPackId).toHaveBeenCalledWith('song');
    expect(setCurrentPackId.mock.invocationCallOrder[0]).toBeLessThan(
      loadCode.mock.invocationCallOrder[0]
    );
    expect(projectPlayer.getMetadata().packId).toBe('song');
  });
});
