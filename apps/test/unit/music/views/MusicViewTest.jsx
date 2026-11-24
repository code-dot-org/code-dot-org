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
