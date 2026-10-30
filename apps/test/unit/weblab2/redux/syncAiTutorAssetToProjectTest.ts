import {AssetSource} from '@cdo/apps/aichat/types/assets';
import {MultiFileSource} from '@cdo/apps/lab2/types';
import {RootState} from '@cdo/apps/types/redux';
import {
  syncAiTutorAssetToProject,
  AI_TUTOR_UPLOADS_FOLDER,
} from '@cdo/apps/weblab2/redux/syncAiTutorAssetToProject';

const mockSetAndSaveSource = jest.fn(source => ({
  type: 'SET_AND_SAVE_SOURCE',
  source,
}));
const mockUpdateStagedFileFilename = jest.fn(payload => ({
  type: 'UPDATE_STAGED_FILE_FILENAME',
  payload,
}));

jest.mock('@cdo/apps/lab2/redux/lab2ProjectReduxThunks', () => ({
  setAndSaveSource: (source: MultiFileSource) => mockSetAndSaveSource(source),
}));
jest.mock('@cdo/apps/aichat/redux', () => ({
  updateStagedFileFilename: (payload: {key: string; filename: string}) =>
    mockUpdateStagedFileFilename(payload),
}));

const CHANNEL_URL = '/v3/assets/channel123/photo.png';
const FOLDER_ID = '1';

const makeSource = (existingFilenames: string[] = []): MultiFileSource => {
  const files: MultiFileSource['files'] = {};
  existingFilenames.forEach((name, i) => {
    const id = String(i + 1);
    files[id] = {id, name, contents: '', folderId: FOLDER_ID, url: CHANNEL_URL};
  });
  return {
    folders: {
      [FOLDER_ID]: {
        id: FOLDER_ID,
        name: AI_TUTOR_UPLOADS_FOLDER,
        parentId: '0',
      },
    },
    files,
    openFiles: [],
  };
};

const makeGetState = (
  source: MultiFileSource,
  stagedFiles: {key: string; asset: {filename: string}}[] = []
) =>
  (() => ({
    lab2Project: {projectSources: {source}},
    aichat: {stagedFiles},
  })) as unknown as () => RootState;

describe('syncAiTutorAssetToProject', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn(action =>
      typeof action === 'function' ? action(dispatch) : action
    );
    mockSetAndSaveSource.mockClear();
    mockUpdateStagedFileFilename.mockClear();
  });

  it('adds a new file with the original name when no duplicate exists', () => {
    const source = makeSource([]);

    syncAiTutorAssetToProject(
      {filename: 'photo.png', source: AssetSource.PROJECT},
      CHANNEL_URL
    )(dispatch, makeGetState(source));

    expect(mockSetAndSaveSource).toHaveBeenCalledTimes(1);
    const saved: MultiFileSource = mockSetAndSaveSource.mock.calls[0][0];
    const names = Object.values(saved.files).map(f => f.name);
    expect(names).toContain('photo.png');
  });

  it('renames with a numeric suffix instead of overwriting when a duplicate exists', () => {
    const source = makeSource(['photo.png']);

    syncAiTutorAssetToProject(
      {filename: 'photo.png', source: AssetSource.PROJECT},
      CHANNEL_URL
    )(dispatch, makeGetState(source));

    expect(mockSetAndSaveSource).toHaveBeenCalledTimes(1);
    const saved: MultiFileSource = mockSetAndSaveSource.mock.calls[0][0];
    const names = Object.values(saved.files).map(f => f.name);
    expect(names).toContain('photo.png');
    expect(names).toContain('photo_1.png');
    expect(names).toHaveLength(2);
  });

  it('increments the suffix for each additional duplicate', () => {
    const source = makeSource(['photo.png', 'photo_1.png']);

    syncAiTutorAssetToProject(
      {filename: 'photo.png', source: AssetSource.PROJECT},
      CHANNEL_URL
    )(dispatch, makeGetState(source));

    const saved: MultiFileSource = mockSetAndSaveSource.mock.calls[0][0];
    const names = Object.values(saved.files).map(f => f.name);
    expect(names).toContain('photo_2.png');
  });

  describe('staged file filename update on deduplication', () => {
    it('updates the staged file filename to the unique name when a duplicate exists', () => {
      const source = makeSource(['photo.png']);
      const stagedFiles = [
        {key: 'photo.png-12345', asset: {filename: 'photo.png'}},
      ];

      syncAiTutorAssetToProject(
        {filename: 'photo.png', source: AssetSource.PROJECT},
        CHANNEL_URL
      )(dispatch, makeGetState(source, stagedFiles));

      expect(mockUpdateStagedFileFilename).toHaveBeenCalledWith({
        key: 'photo.png-12345',
        filename: 'photo_1.png',
      });
    });

    it('does not update the staged file filename when no duplicate exists', () => {
      const source = makeSource([]);
      const stagedFiles = [
        {key: 'photo.png-12345', asset: {filename: 'photo.png'}},
      ];

      syncAiTutorAssetToProject(
        {filename: 'photo.png', source: AssetSource.PROJECT},
        CHANNEL_URL
      )(dispatch, makeGetState(source, stagedFiles));

      expect(mockUpdateStagedFileFilename).not.toHaveBeenCalled();
    });

    it('updates the most recently added staged file when multiple share the same filename', () => {
      const source = makeSource(['photo.png']);
      const stagedFiles = [
        {key: 'photo.png-11111', asset: {filename: 'photo.png'}},
        {key: 'photo.png-22222', asset: {filename: 'photo.png'}},
      ];

      syncAiTutorAssetToProject(
        {filename: 'photo.png', source: AssetSource.PROJECT},
        CHANNEL_URL
      )(dispatch, makeGetState(source, stagedFiles));

      expect(mockUpdateStagedFileFilename).toHaveBeenCalledWith({
        key: 'photo.png-22222',
        filename: 'photo_1.png',
      });
    });
  });
});
