import {UnconnectedMusicView} from '@cdo/apps/music/views/MusicView';

jest.mock('@cdo/apps/music/blockly/MusicBlocklyWorkspace', () => {
  const MusicBlocklyWorkspace = jest.fn(() => ({getCode: () => ({})}));
  MusicBlocklyWorkspace.setupBlocklyEnvironment = jest.fn();
  return {__esModule: true, default: MusicBlocklyWorkspace};
});
jest.mock('@cdo/apps/music/blockly/toolbox', () => ({}));
jest.mock('@cdo/apps/music/player/MusicPlayer', () => jest.fn());
jest.mock('@cdo/apps/music/views/MusicLabView', () => () => null);

describe('MusicView', () => {
  describe('getPackId', () => {
    const songSource = JSON.stringify({
      blocks: {blocks: [{type: 'play_sound', fields: {sound: 'song/verse_1'}}]},
    });
    const drumsSource = JSON.stringify({
      blocks: {blocks: [{type: 'play_sound', fields: {sound: 'drums/beat'}}]},
    });
    const savedPack = packId => ({music: {packId}});

    const getPackId = (levelData, sources) => {
      const view = new UnconnectedMusicView({
        blockMode: 'Simple2',
        levelProperties: {levelData},
      });
      view.library = {
        getFolderForSoundId: id =>
          id.startsWith('song/') ? {id: 'song', restricted: true} : null,
      };
      return view.getPackId(levelData, sources);
    };

    it("uses the level's pack ahead of the project's", () => {
      expect(
        getPackId(
          {packId: 'level'},
          {source: songSource, labConfig: savedPack('saved')}
        )
      ).toBe('level');
    });

    it('uses the pack of the sounds in the code when no pack is saved', () => {
      expect(getPackId({}, {source: songSource})).toBe('song');
    });

    it('uses the pack of the sounds in the code ahead of the saved pack', () => {
      expect(
        getPackId({}, {source: songSource, labConfig: savedPack('other')})
      ).toBe('song');
    });

    it('uses the saved pack when the code has no sound from a restricted pack', () => {
      expect(
        getPackId({}, {source: drumsSource, labConfig: savedPack('saved')})
      ).toBe('saved');
    });

    it('has no pack for a project with nothing saved', () => {
      expect(getPackId({}, undefined)).toBeUndefined();
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
