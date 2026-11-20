import {UnconnectedMusicView} from '@cdo/apps/music/views/MusicView';

jest.mock('@cdo/apps/music/blockly/MusicBlocklyWorkspace', () => {
  const MusicBlocklyWorkspace = jest.fn(() => ({
    getAllBlocks: () => [],
    getCode: () => ({}),
    initHeadless: jest.fn(),
    loadCode: jest.fn(),
    resizeBlockly: jest.fn(),
  }));
  MusicBlocklyWorkspace.setupBlocklyEnvironment = jest.fn();
  return {__esModule: true, default: MusicBlocklyWorkspace};
});
jest.mock('@cdo/apps/music/blockly/toolbox', () => ({}));
jest.mock('@cdo/apps/music/player/MusicPlayer', () => jest.fn());
jest.mock('@cdo/apps/music/views/MusicLabView', () => () => null);

describe('MusicView', () => {
  const sourceWithSounds = (...sounds) =>
    JSON.stringify({
      blocks: {
        blocks: sounds.map(sound => ({type: 'play_sound', fields: {sound}})),
      },
    });
  const restrictedPacks = ['song', 'song2'];
  const createLibrary = () => ({
    getFolderForSoundId: id => {
      const folderId = id.split('/')[0];
      return restrictedPacks.includes(folderId)
        ? {id: folderId, restricted: true}
        : null;
    },
    getCurrentPackId: jest.fn(),
    setAllowedSounds: jest.fn(),
    setCurrentPackId: jest.fn(),
  });

  describe('getPackId', () => {
    const sources = {source: sourceWithSounds('song/verse')};

    const getPackId = levelData => {
      const view = new UnconnectedMusicView({
        blockMode: 'Simple2',
        levelProperties: {levelData},
      });
      view.library = createLibrary();
      return view.getPackId(levelData, sources);
    };

    it("uses the level's pack ahead of the project's", () => {
      expect(getPackId({packId: 'level'})).toBe('level');
    });

    it("uses the project's pack on a level without one", () => {
      expect(getPackId({})).toBe('song');
    });
  });

  describe('a project saved with its sounds but not its pack', () => {
    const source = sourceWithSounds('song/verse');

    it('gets the pack before its code is loaded, and is saved with it', async () => {
      const save = jest.fn();
      const view = new UnconnectedMusicView({
        blockMode: 'Simple2',
        levelProperties: {levelData: {}},
        isPlayView: true,
        projectManager: {save},
        setPackId: jest.fn(),
        setStartingPlayheadPosition: jest.fn(),
      });
      const library = createLibrary();
      library.getCurrentPackId.mockImplementation(
        () => library.setCurrentPackId.mock.lastCall?.[0]
      );
      view.loadAndInitializePlayer = async () => {
        view.library = library;
      };
      view.compileSong = jest.fn();
      view.executeCompiledSong = jest.fn();
      view.analyticsReporter = {onBlocksUpdated: jest.fn()};

      await view.onLevelLoad({}, {source});

      const {loadCode} = view.musicBlocklyWorkspace;
      expect(library.setCurrentPackId).toHaveBeenCalledWith('song');
      expect(library.setCurrentPackId.mock.invocationCallOrder[0]).toBeLessThan(
        loadCode.mock.invocationCallOrder[0]
      );
      expect(save.mock.lastCall[0].labConfig.music.packId).toBe('song');
    });

    it('gets the pack before its code is loaded from Version History', () => {
      const setPackId = jest.fn();
      const view = new UnconnectedMusicView({
        blockMode: 'Simple2',
        levelProperties: {levelData: {}},
        isReadOnlyWorkspace: true,
        setPackId,
        projectSources: {source},
      });
      view.library = createLibrary();
      view.setState = jest.fn();

      view.componentDidUpdate({isReadOnlyWorkspace: true});

      const {loadCode} = view.musicBlocklyWorkspace;
      expect(view.library.setCurrentPackId).toHaveBeenCalledWith('song');
      expect(setPackId).toHaveBeenCalledWith('song');
      expect(loadCode).toHaveBeenCalledTimes(1);
      expect(
        view.library.setCurrentPackId.mock.invocationCallOrder[0]
      ).toBeLessThan(loadCode.mock.invocationCallOrder[0]);
    });
  });

  describe('saveCode', () => {
    const saveWithLibraryPack = packId => {
      const save = jest.fn();
      const view = new UnconnectedMusicView({
        blockMode: 'Simple2',
        levelProperties: {levelData: {}},
        projectManager: {save},
      });
      view.library = {getCurrentPackId: () => packId};
      view.saveCode();
      return save.mock.calls[0][0];
    };

    it('saves the pack the library has, without waiting for props', () => {
      const sources = saveWithLibraryPack('pack1');
      expect(sources.labConfig.music.packId).toBe('pack1');
    });

    it('saves no pack when the library has none', () => {
      const sources = saveWithLibraryPack(null);
      expect(sources.labConfig.music).not.toHaveProperty('packId');
    });
  });
});
