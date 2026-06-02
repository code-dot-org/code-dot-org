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

jest.mock('@cdo/apps/lab2/redux/lab2ProjectReduxThunks', () => ({
  setAndSaveSource: (source: MultiFileSource) => mockSetAndSaveSource(source),
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

const makeGetState = (source: MultiFileSource) =>
  (() => ({
    lab2Project: {projectSources: {source}},
  })) as unknown as () => RootState;

describe('syncAiTutorAssetToProject', () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    dispatch = jest.fn(action =>
      typeof action === 'function' ? action(dispatch) : action
    );
    mockSetAndSaveSource.mockClear();
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
});
