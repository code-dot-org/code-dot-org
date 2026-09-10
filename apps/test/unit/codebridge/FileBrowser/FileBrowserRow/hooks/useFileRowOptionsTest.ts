import {useFileRowOptions} from '@codebridge/FileBrowser/FileBrowserRow/hooks/useFileRowOptions';
import {renderHook} from '@testing-library/react-hooks';

import codebridgeI18n from '@cdo/apps/codebridge/locale';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {useBackpackAPIContext} from '@cdo/apps/sharedComponents/backpack/BackpackAPIContext';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';
import experiments from '@cdo/apps/util/experiments';

let mockState: {
  lab2Project: {
    projectSources: {
      source: {
        files: {
          [key: string]: {
            id: string;
            name: string;
            contents: string;
            folderId: string;
          };
        };
        folders: Record<string, never>;
      };
    };
  };
  currentUser: {userId: number | undefined};
};

let mockAiTutorDisabled = false;
let mockEnableUserAddedSelectionContext = true;
const mockUnifiedBackpackApi = {};

jest.mock('@codebridge/codebridgeContext', () => ({
  useCodebridgeContext: jest.fn(() => ({
    config: {supportedFileTypes: ['html']},
    levelProperties: {appName: 'weblab2'},
    aiTutorDisabled: mockAiTutorDisabled,
    enableUserAddedSelectionContext: mockEnableUserAddedSelectionContext,
  })),
}));

jest.mock('@codebridge/FileBrowser/hooks', () => ({
  usePrompts: jest.fn(() => ({
    openConfirmDeleteFile: jest.fn(),
    openMoveFilePrompt: jest.fn(),
    openRenameFilePrompt: jest.fn(),
    openSaveToBackpackPrompt: jest.fn(),
  })),
}));

jest.mock('@cdo/apps/aichat/redux', () => ({
  sendAnalytics: jest.fn(),
}));

jest.mock('@cdo/apps/aichat/redux/slice', () => ({
  addItemToUserAddedSelectionContext: jest.fn(),
  addStagedFile: jest.fn(),
}));

jest.mock('@cdo/apps/lab2/projects/utils', () => ({
  ...jest.requireActual('@cdo/apps/lab2/projects/utils'),
  getAppOptionsEditBlocks: jest.fn(),
}));

jest.mock('@cdo/apps/sharedComponents/backpack/BackpackAPIContext', () => ({
  useBackpackAPIContext: jest.fn(),
}));

jest.mock('@cdo/apps/util/experiments', () => ({
  __esModule: true,
  default: {
    ...jest.requireActual('@cdo/apps/util/experiments').default,
    isEnabledAllowingQueryString: jest.fn(() => false),
  },
}));

jest.mock('@cdo/apps/lab2/Lab2Registry', () => ({
  __esModule: true,
  default: {
    getInstance: () => ({
      getUnifiedBackpackApi: () => mockUnifiedBackpackApi,
    }),
  },
}));

jest.mock('@cdo/apps/util/reduxHooks', () => ({
  ...jest.requireActual('@cdo/apps/util/reduxHooks'),
  useAppSelector: (selector: (state: typeof mockState) => unknown) =>
    selector(mockState),
  useAppDispatch: () => jest.fn(),
}));

const mockGetAppOptionsEditBlocks =
  getAppOptionsEditBlocks as jest.MockedFunction<
    typeof getAppOptionsEditBlocks
  >;
const mockUseBackpackAPIContext = useBackpackAPIContext as jest.MockedFunction<
  typeof useBackpackAPIContext
>;
const mockIsExperimentEnabled =
  experiments.isEnabledAllowingQueryString as jest.MockedFunction<
    typeof experiments.isEnabledAllowingQueryString
  >;

describe('useFileRowOptions', () => {
  const file = {
    id: '1',
    name: 'index.html',
    contents: '<h1>hello</h1>',
    folderId: '0',
  };

  beforeEach(() => {
    mockState = {
      lab2Project: {
        projectSources: {
          source: {
            files: {
              [file.id]: file,
            },
            folders: {},
          },
        },
      },
      currentUser: {userId: 1},
    };
    mockAiTutorDisabled = false;
    mockEnableUserAddedSelectionContext = true;
    mockGetAppOptionsEditBlocks.mockReturnValue(undefined);
    mockUseBackpackAPIContext.mockReturnValue(null);
    mockIsExperimentEnabled.mockReturnValue(false);
  });

  const visibleLabelsFor = (target = file) => {
    const {result} = renderHook(() => useFileRowOptions(target, false));
    return result.current
      .filter(option => option.condition)
      .map(option => option.labelText);
  };

  it('includes add to AI tutor chat when AI tutor is enabled', () => {
    const {result} = renderHook(() => useFileRowOptions(file, false));

    const visibleLabels = result.current
      .filter(option => option.condition)
      .map(option => option.labelText);

    expect(visibleLabels).toContain(codebridgeI18n.addToAiTutorContext());
  });

  it('hides add to AI tutor chat when AI tutor is disabled', () => {
    mockAiTutorDisabled = true;

    const {result} = renderHook(() => useFileRowOptions(file, false));

    const visibleLabels = result.current
      .filter(option => option.condition)
      .map(option => option.labelText);

    expect(visibleLabels).not.toContain(codebridgeI18n.addToAiTutorContext());
  });

  it('hides add to AI tutor chat when context feature is disabled', () => {
    mockEnableUserAddedSelectionContext = false;

    const {result} = renderHook(() => useFileRowOptions(file, false));

    const visibleLabels = result.current
      .filter(option => option.condition)
      .map(option => option.labelText);

    expect(visibleLabels).not.toContain(codebridgeI18n.addToAiTutorContext());
  });

  it('hides add to AI tutor chat for audio files', () => {
    const audioFile = {
      id: '2',
      name: 'beep.WAV',
      contents: '',
      folderId: '0',
      url: '/v3/assets/channel/beep.wav',
    };
    mockState.lab2Project.projectSources.source.files[audioFile.id] = audioFile;

    const {result} = renderHook(() => useFileRowOptions(audioFile, false));

    const visibleLabels = result.current
      .filter(option => option.condition)
      .map(option => option.labelText);

    expect(visibleLabels).not.toContain(codebridgeI18n.addToAiTutorContext());
  });

  describe('save to backpack option', () => {
    it('hides save to backpack when there is no per-lab backpack', () => {
      expect(visibleLabelsFor()).not.toContain(
        codebridgeI18n.saveToBackpackTitle()
      );
    });

    it('shows save to backpack when the per-lab backpack is available', () => {
      mockUseBackpackAPIContext.mockReturnValue({
        primaryApi: {} as BackpackClientApi,
      });

      expect(visibleLabelsFor()).toContain(
        codebridgeI18n.saveToBackpackTitle()
      );
    });

    it('shows save to backpack under the experiment even with no per-lab backpack', () => {
      mockIsExperimentEnabled.mockReturnValue(true);

      expect(visibleLabelsFor()).toContain(
        codebridgeI18n.saveToBackpackTitle()
      );
    });

    it('hides save to backpack under the experiment when signed out', () => {
      mockIsExperimentEnabled.mockReturnValue(true);
      mockState.currentUser.userId = undefined;

      expect(visibleLabelsFor()).not.toContain(
        codebridgeI18n.saveToBackpackTitle()
      );
    });
  });
});
